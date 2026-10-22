#!/usr/bin/env node
// Native, local candidate-directory pilot. No package installation or network calls.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (root, target) => target === root || (!path.relative(root, target).startsWith(`..${path.sep}`) && path.relative(root, target) !== '..' && !path.isAbsolute(path.relative(root, target)));

function relativeFile(value) {
  if (typeof value !== 'string' || !value || path.isAbsolute(value) || /[\\\0]/.test(value) || value.split('/').some(p => !p || p === '.' || p === '..')) throw new Error(`Invalid package-relative path: ${value}`);
  if (value.split('/').some(p => ['.git', 'node_modules', '.publisher-pilot'].includes(p) || /^\.env(?:\.|$)/.test(p))) throw new Error(`Local/private directory or environment file cannot be delivered: ${value}`);
  return value;
}

export function inventory(root, entries) {
  const files = new Map();
  function visit(rel) {
    relativeFile(rel);
    let component = root;
    for (const name of rel.split('/')) {
      component = path.join(component, name);
      if (fs.lstatSync(component).isSymbolicLink()) throw new Error(`Symlinks are not supported in this pilot: ${rel}`);
    }
    const abs = path.join(root, rel);
    const stat = fs.lstatSync(abs);
    if (stat.isSymbolicLink()) throw new Error(`Symlinks are not supported in this pilot: ${rel}`);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(abs).sort()) visit(`${rel}/${name}`);
    } else if (stat.isFile()) {
      files.set(rel, { path: rel, sha256: hash(fs.readFileSync(abs)), executable: Boolean(stat.mode & 0o111) });
    } else throw new Error(`Unsupported file type: ${rel}`);
  }
  for (const entry of entries) visit(entry);
  return [...files.values()].sort((a, b) => a.path.localeCompare(b.path, 'en'));
}

export function digestInventory(files) { return hash(JSON.stringify(files)); }

function copyInventory(from, to, files) {
  for (const file of files) {
    const destination = path.join(to, file.path);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(from, file.path), destination);
    fs.chmodSync(destination, file.executable ? 0o755 : 0o644);
  }
}

function validate(config) {
  if (config.schemaVersion !== 1 || config.delivery?.type !== 'candidate-directory') throw new Error('Expected schemaVersion 1 and candidate-directory delivery.');
  if (!Array.isArray(config.delivery.include) || !config.delivery.include.length) throw new Error('An explicit delivery include list is required.');
  config.delivery.include.forEach(relativeFile);
  if (!Array.isArray(config.cases) || !config.cases.length) throw new Error('At least one automated case is required.');
  if (!Array.isArray(config.manual) || !config.manual.length) throw new Error('Explicit client/manual verification requirements are required.');
  const ids = new Set(['installation-integrity', 'installed-content-unchanged', 'candidate-unchanged', 'source-unchanged']);
  for (const item of [...config.cases, ...config.manual]) {
    if (!/^[a-z0-9-]+$/.test(item.id) || ids.has(item.id) || typeof item.required !== 'boolean') throw new Error('Cases need unique IDs and an explicit required boolean.');
    ids.add(item.id);
  }
  for (const item of config.cases) {
    if (!Array.isArray(item.command) || item.command[0] !== 'node' || item.command.length < 2 || item.command.some(a => typeof a !== 'string')) throw new Error(`Only explicit Node argument arrays are supported: ${item.id}`);
    if (!Number.isInteger(item.timeoutMs) || item.timeoutMs < 1 || item.timeoutMs > 60000) throw new Error(`Set a timeout of 1..60000 ms: ${item.id}`);
  }
  for (const item of config.manual) if (typeof item.instruction !== 'string' || !item.instruction.trim()) throw new Error(`Missing manual instruction: ${item.id}`);
}

export function summarize(results) {
  const required = results.filter(r => r.required);
  const failures = !required.length || required.some(r => ['FAIL', 'ERROR', 'SKIPPED'].includes(r.status));
  const review = required.some(r => r.status !== 'PASS');
  return { status: failures ? 'BLOCKED' : review ? 'REVIEW_REQUIRED' : 'PASS',
    automatedPassed: results.filter(r => r.kind === 'automated' && r.status === 'PASS').length,
    requiredUnresolved: required.filter(r => r.status !== 'PASS').map(r => r.id),
    publicationAuthorized: false };
}

function validateReportTarget(reportPath, configPath, sourceRoot, sourceFiles) {
  if (reportPath === configPath || sourceFiles.some(f => path.resolve(sourceRoot, f.path) === reportPath)) throw new Error('The report cannot overwrite configuration or delivery files.');
  let current = reportPath;
  while (true) {
    let stat;
    try { stat = fs.lstatSync(current); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (stat?.isSymbolicLink()) throw new Error('Report output cannot follow a symlink.');
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  if (fs.existsSync(reportPath)) {
    let previous;
    try { previous = JSON.parse(fs.readFileSync(reportPath, 'utf8')); } catch { /* handled below */ }
    if (previous?.reportType !== 'publisher-native-acceptance' || previous.schemaVersion !== 1) throw new Error('Refusing to overwrite a file that is not a native acceptance report.');
  }
}

export function runAcceptance({ root, configPath, reportPath }) {
  root = fs.realpathSync(root);
  configPath = path.resolve(root, configPath);
  reportPath = path.resolve(root, reportPath);
  const configBytes = fs.readFileSync(configPath);
  const config = JSON.parse(configBytes);
  validate(config);
  const sourceFiles = inventory(root, config.delivery.include);
  validateReportTarget(reportPath, configPath, root, sourceFiles);
  const workBase = path.join(root, '.publisher-pilot');
  // Never follow an existing symlink into user files.
  if (fs.existsSync(workBase) && fs.lstatSync(workBase).isSymbolicLink()) throw new Error('Work directory cannot be a symlink.');
  fs.mkdirSync(workBase, { recursive: true });
  const work = fs.mkdtempSync(path.join(workBase, 'run-'));
  const candidate = path.join(work, 'candidate');
  const installed = path.join(work, 'installed');
  const evidence = path.join(work, 'evidence');
  const cleanHome = path.join(work, 'home');
  const temp = path.join(work, 'tmp');
  for (const dir of [candidate, installed, evidence, cleanHome, temp]) fs.mkdirSync(dir);
  if (inside(work, reportPath)) throw new Error('Report path must be outside the installation workspace.');
  copyInventory(root, candidate, sourceFiles);
  const candidateFiles = inventory(candidate, config.delivery.include);
  const candidateDigest = digestInventory(candidateFiles);
  if (candidateDigest !== digestInventory(sourceFiles)) throw new Error('Candidate differs from the source snapshot.');
  // Install strictly from the deliverable, never from the development tree.
  copyInventory(candidate, installed, candidateFiles);
  const installedDigest = digestInventory(inventory(installed, config.delivery.include));
  const git = args => {
    const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', timeout: 5000 });
    return r.status === 0 ? r.stdout.trim() : null;
  };
  const results = [{ id: 'installation-integrity', kind: 'automated', required: true,
    status: installedDigest === candidateDigest ? 'PASS' : 'FAIL', detail: 'Candidate and fresh directory installation have identical paths, bytes and executable flags.' }];
  const env = {};
  for (const key of ['PATH', 'SystemRoot', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT']) if (process.env[key]) env[key] = process.env[key];
  Object.assign(env, { HOME: cleanHome, USERPROFILE: cleanHome, XDG_CONFIG_HOME: path.join(cleanHome, 'config'),
    APPDATA: path.join(cleanHome, 'appdata'), LOCALAPPDATA: path.join(cleanHome, 'localappdata'),
    TMPDIR: temp, TMP: temp, TEMP: temp, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: path.join(cleanHome, '.gitconfig'),
    PUBLISHER_EVIDENCE_DIR: evidence, PUBLISHER_INSTALL_ROOT: installed });
  for (const item of config.cases) {
    const logfile = path.join(evidence, `${item.id}.log`);
    const started = Date.now();
    const child = spawnSync(process.execPath, item.command.slice(1), { cwd: installed, env, shell: false,
      encoding: 'utf8', timeout: item.timeoutMs, maxBuffer: 4 * 1024 * 1024 });
    const status = child.error || child.signal || child.status === null ? 'ERROR' : child.status === 0 ? 'PASS' : 'FAIL';
    fs.writeFileSync(logfile, `${child.stdout ?? ''}${child.stderr ?? ''}${child.error ? `\n${child.error.message}` : ''}`);
    results.push({ id: item.id, kind: 'automated', required: item.required, status, command: item.command,
      durationMs: Date.now() - started, exitCode: child.status, signal: child.signal,
      log: path.relative(root, logfile).split(path.sep).join('/') });
  }
  // Include additions/deletions anywhere in either tree, not only original include paths.
  for (const [id, directory] of [['installed-content-unchanged', installed], ['candidate-unchanged', candidate]]) {
    const current = inventory(directory, fs.readdirSync(directory));
    results.push({ id, kind: 'automated', required: true, status: digestInventory(current) === candidateDigest ? 'PASS' : 'FAIL',
      detail: 'Reports and task outputs must stay outside delivery and installed files.' });
  }
  results.push({ id: 'source-unchanged', kind: 'automated', required: true,
    status: digestInventory(inventory(root, config.delivery.include)) === candidateDigest && hash(fs.readFileSync(configPath)) === hash(configBytes) ? 'PASS' : 'FAIL',
    detail: 'Included source content and acceptance configuration stayed unchanged during this run.' });
  for (const item of config.manual) results.push({ ...item, kind: 'manual', status: 'REVIEW_REQUIRED' });
  const report = { reportType: 'publisher-native-acceptance', schemaVersion: 1, checkedAt: new Date().toISOString(),
    environment: { platform: process.platform, arch: process.arch, node: process.version },
    delivery: { type: config.delivery.type, sourceCommit: git(['rev-parse', 'HEAD']), workingTreeStatus: git(['status', '--porcelain']),
      configDigest: hash(configBytes), candidateDigest, files: candidateFiles,
      candidate: path.relative(root, candidate).split(path.sep).join('/'), installed: path.relative(root, installed).split(path.sep).join('/') },
    isolation: 'Separate delivery, installation, home and temporary directories with a minimal environment; not an OS or network sandbox.',
    results, summary: summarize(results) };
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const options = new Map(args.filter(a => a.includes('=')).map(a => [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)]));
    if (args.some(a => a !== '--json' && (!/^--(?:config|report)=.+$/.test(a)))) throw new Error('Supported arguments: --config=PATH --report=PATH --json');
    const report = runAcceptance({ root: process.cwd(), configPath: options.get('--config') ?? 'evals/acceptance.json', reportPath: options.get('--report') ?? 'acceptance-report.json' });
    if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`Acceptance: ${report.summary.status}`);
      for (const result of report.results) console.log(`- ${result.status} ${result.id}`);
      console.log('This pilot does not authorize publication or certify client loading.');
    }
    process.exitCode = report.summary.status === 'BLOCKED' ? 1 : report.summary.status === 'REVIEW_REQUIRED' ? 2 : 0;
  } catch (error) {
    console.error(`Acceptance ERROR: ${error.message}`);
    console.error('No new acceptance report was written; any previous report is not a result of this run.');
    process.exitCode = 1;
  }
}
