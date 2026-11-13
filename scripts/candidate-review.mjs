#!/usr/bin/env node
/** Explicit external content-review receipts; never publication authority. */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { gitFiles } from './git-files.mjs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (root, p) => { const rel = path.relative(root, p); return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel)); };
export function candidateDigest(root, { reportPath } = {}) {
  const files = [];
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      const p = path.join(dir, e.name);
      if (p === reportPath) continue;
      if (e.isSymbolicLink()) throw new Error('candidate review does not support symlinks');
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) files.push([path.relative(root, p).split(path.sep).join('/'), hash(fs.readFileSync(p))]);
      else throw new Error('candidate review does not support special files');
    }
  };
  // Git delivery: tracked and visible untracked files, excluding ignored local artifacts.
  let inGit = false;
  try { inGit = execFileSync('git',['rev-parse','--show-toplevel'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim() === fs.realpathSync(root); } catch {}
  if (inGit) {
    for (const rel of gitFiles(root)) {
      const p = path.join(root, rel);
      if (p === reportPath) continue;
      let component = root;
      for (const name of rel.split('/')) {
        component = path.join(component, name);
        if (fs.existsSync(component) && fs.lstatSync(component).isSymbolicLink()) throw new Error('candidate review does not support symlinks');
      }
      let stat;
      try { stat = fs.lstatSync(p); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
      if (!stat.isFile()) throw new Error('candidate delivery must contain regular files');
      files.push([rel, hash(fs.readFileSync(p))]);
    }
  } else walk(root);
  files.sort((a,b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  return hash(JSON.stringify(files));
}
export function loadCandidateReview(root, file, digest) {
  if (!file) return { decisions: [], status: 'not-supplied' };
  try {
    const realRoot = fs.realpathSync(root), real = fs.realpathSync(file);
    if (inside(realRoot, real)) throw new Error('receipt must be outside candidate');
    if (fs.statSync(real).size > 1024 * 1024) throw new Error('receipt too large');
    const value = JSON.parse(fs.readFileSync(real, 'utf8'));
    if (value.schemaVersion !== 1 || value.kind !== 'candidate-content-review' || !digest || value.candidateDigest !== digest || !Array.isArray(value.decisions)) throw new Error('candidate review identity/digest mismatch');
    const decisions = value.decisions.filter(d => {
      if (d.decision !== 'keep' || d.revoked || typeof d.reviewId !== 'string' || !d.reviewId || typeof d.userQuote !== 'string' || !d.userQuote.trim() || !Number.isFinite(Date.parse(d.confirmedAt))) return false;
      const ref = d.sourceEvidence;
      if (!ref || typeof ref.path !== 'string' || !path.isAbsolute(ref.path) || !/^[a-f0-9]{64}$/.test(ref.sha256 ?? '')) return false;
      try {
        const p = fs.realpathSync(ref.path);
        if (inside(realRoot, p) || fs.statSync(p).size > 1024 * 1024) return false;
        const bytes = fs.readFileSync(p);
        return hash(bytes) === ref.sha256 && bytes.toString('utf8').includes(d.userQuote);
      } catch { return false; }
    });
    return { decisions, status: 'loaded', validDecisions: decisions.length, invalidDecisions: value.decisions.length - decisions.length };
  } catch (error) { return { decisions: [], status: 'invalid', reason: error.message }; }
}
