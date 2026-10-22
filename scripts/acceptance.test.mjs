#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runAcceptance, inventory, summarize } from './acceptance.mjs';

function fixture(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publisher-acceptance-'));
  fs.writeFileSync(path.join(root, 'SKILL.md'), '# Isolated fixture\n');
  const config = { schemaVersion: 1, delivery: { type: 'candidate-directory', include: ['SKILL.md', 'task.mjs'] },
    cases: [{ id: 'task', required: true, command: ['node', 'task.mjs'], timeoutMs: 3000 }],
    manual: [{ id: 'client-loading', required: true, instruction: 'Verify real client discovery and behavior.' }] };
  fs.writeFileSync(path.join(root, 'task.mjs'), "import fs from 'node:fs'; import assert from 'node:assert/strict'; assert.ok(fs.existsSync('SKILL.md')); assert.equal(process.env.PUBLISHER_TEST_SECRET, undefined); assert.ok(!fs.existsSync('.git')); console.log('Installed task completed');\n");
  const run = () => {
    fs.writeFileSync(path.join(root, 'acceptance.json'), JSON.stringify(config));
    return runAcceptance({ root, configPath: 'acceptance.json', reportPath: 'report.json' });
  };
  try { return fn({ root, config, run }); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test('fresh candidate install runs the delivered task; client checks stay unresolved', () => fixture(({ root, run }) => {
  fs.mkdirSync(path.join(root, '.git'));
  fs.writeFileSync(path.join(root, 'private.txt'), 'must not be copied');
  const report = run();
  assert.equal(report.results.find(r => r.id === 'task').status, 'PASS');
  assert.equal(report.summary.status, 'REVIEW_REQUIRED');
  assert.equal(report.summary.publicationAuthorized, false);
  assert.equal(fs.existsSync(path.join(root, report.delivery.installed, 'private.txt')), false);
  assert.equal(report.delivery.files.length, 2);
  assert.equal(report.delivery.candidateDigest.length, 64);
  assert.equal(report.results.find(r => r.id === 'client-loading').status, 'REVIEW_REQUIRED');
}));
test('a failing task blocks acceptance', () => fixture(({ root, run }) => {
  fs.writeFileSync(path.join(root, 'task.mjs'), 'process.exit(1);');
  const report = run();
  assert.equal(report.summary.status, 'BLOCKED');
  assert.equal(report.results.find(r => r.id === 'task').status, 'FAIL');
}));
test('timeout is ERROR and cannot become a pass or optional skip', () => fixture(({ root, config, run }) => {
  config.cases[0].timeoutMs = 30;
  fs.writeFileSync(path.join(root, 'task.mjs'), 'setInterval(() => {}, 1000);');
  const report = run();
  assert.equal(report.summary.status, 'BLOCKED');
  assert.equal(report.results.find(r => r.id === 'task').status, 'ERROR');
}));
test('missing delivered script fails even if it exists only in development', () => fixture(({ config, run }) => {
  config.delivery.include = ['SKILL.md'];
  const report = run();
  assert.equal(report.results.find(r => r.id === 'task').status, 'FAIL');
  assert.equal(report.summary.status, 'BLOCKED');
}));
test('modifying installation files invalidates otherwise successful tasks', () => fixture(({ root, run }) => {
  fs.writeFileSync(path.join(root, 'task.mjs'), "import fs from 'node:fs';fs.appendFileSync('SKILL.md','changed');");
  const report = run();
  assert.equal(report.results.find(r => r.id === 'task').status, 'PASS');
  assert.equal(report.results.find(r => r.id === 'installed-content-unchanged').status, 'FAIL');
  assert.equal(report.summary.status, 'BLOCKED');
}));
test('candidate digest changes with delivered bytes', () => fixture(({ root, run }) => {
  const first = run();
  fs.appendFileSync(path.join(root, 'SKILL.md'), 'different');
  const second = run();
  assert.notEqual(first.delivery.candidateDigest, second.delivery.candidateDigest);
}));
test('invalid config cannot quietly drop automated or manual acceptance', () => fixture(({ config, run }) => {
  config.manual = []; assert.throws(run, /manual verification/);
  config.manual = [{ id: 'loading', required: true, instruction: 'Verify.' }];
  config.cases = []; assert.throws(run, /automated case/);
}));
test('duplicate IDs, shell commands, traversal and local-only delivery fail validation', () => fixture(({ root, config, run }) => {
  config.cases[0].command = ['sh', '-c', 'true']; assert.throws(run, /Node argument/);
  config.cases[0].command = ['node', 'task.mjs'];
  config.manual[0].id = 'task'; assert.throws(run, /unique IDs/);
  config.manual[0].id = 'loading';
  for (const rel of ['../outside', '.git', '.env', 'node_modules']) {
    config.delivery.include = [rel]; assert.throws(run);
  }
  fs.symlinkSync(root, path.join(root, 'link'), 'junction');
  assert.throws(() => inventory(root, ['link']), /Symlinks/);
  assert.throws(() => inventory(root, ['link/SKILL.md']), /Symlinks/);
}));
test('required skips, errors and unknown statuses block or require review', () => {
  assert.equal(summarize([]).status, 'BLOCKED');
  for (const status of ['FAIL', 'ERROR', 'SKIPPED']) assert.equal(summarize([{ id: 'required', required: true, status }]).status, 'BLOCKED');
  assert.equal(summarize([{ id: 'required', required: true, status: 'UNKNOWN' }]).status, 'REVIEW_REQUIRED');
  assert.equal(summarize([{ id: 'required', required: true, status: 'PASS' }]).status, 'PASS');
});

test('report cannot overwrite user data, the configuration or delivered files', () => fixture(({ root, config, run }) => {
  fs.writeFileSync(path.join(root, 'report.json'), 'user data');
  assert.throws(run, /Refusing to overwrite/);
  assert.equal(fs.readFileSync(path.join(root, 'report.json'), 'utf8'), 'user data');
  for (const reportPath of ['acceptance.json', 'SKILL.md']) {
    fs.writeFileSync(path.join(root, 'acceptance.json'), JSON.stringify(config));
    assert.throws(() => runAcceptance({ root, configPath: 'acceptance.json', reportPath }), /cannot overwrite/);
  }
}));
test('minimal child environment does not inherit a development credential', () => fixture(({ run }) => {
  const old = process.env.PUBLISHER_TEST_SECRET;
  process.env['PUBLISHER_TEST_SECRET'] = 'example-only';
  try { assert.equal(run().results.find(r => r.id === 'task').status, 'PASS'); }
  finally {
    if (old === undefined) delete process.env.PUBLISHER_TEST_SECRET;
    else process.env['PUBLISHER_TEST_SECRET'] = old;
  }
}));
test('CLI preserves review-required and blocking exit codes instead of masking them', () => fixture(({ root, config }) => {
  fs.writeFileSync(path.join(root, 'acceptance.json'), JSON.stringify(config));
  const command = [fileURLToPath(new URL('./acceptance.mjs', import.meta.url)), '--config=acceptance.json', '--report=cli-report.json', '--json'];
  const result = spawnSync(process.execPath, command, { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 2, result.stderr);
  assert.equal(JSON.parse(result.stdout).summary.status, 'REVIEW_REQUIRED');
  fs.writeFileSync(path.join(root, 'task.mjs'), 'process.exit(1);');
  const failed = spawnSync(process.execPath, command, { cwd: root, encoding: 'utf8' });
  assert.equal(failed.status, 1, failed.stderr);
  assert.equal(JSON.parse(failed.stdout).summary.status, 'BLOCKED');
}));
