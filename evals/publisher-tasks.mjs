#!/usr/bin/env node
// Actual installed-tool tasks. These do not simulate an Agent conversation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { inventory, digestInventory } from '../scripts/acceptance.mjs';

const installed = process.cwd();
const evidence = process.env.PUBLISHER_EVIDENCE_DIR;
assert.ok(evidence && process.env.PUBLISHER_INSTALL_ROOT === installed, 'Run through the acceptance runner.');
const task = process.argv[2];
if (task === 'references') {
  const skill = fs.readFileSync('SKILL.md', 'utf8');
  const refs = new Set(skill.match(/\b(?:references|templates|scripts|assets|evals)\/[A-Za-z0-9._/-]+/g) ?? []);
  for (const rel of refs) assert.ok(fs.existsSync(rel), `Missing installed reference: ${rel}`);
  assert.ok(!fs.existsSync('.git'), 'Installation must not borrow the development repository.');
  console.log(`PASS: installed entry point and ${refs.size} referenced files exist without development Git metadata.`);
} else if (task === 'check-only' || task === 'blocker') {
  const target = path.join(evidence, `target-${task}`);
  fs.mkdirSync(path.join(target, 'assets'), { recursive: true });
  const fixture = JSON.parse(fs.readFileSync('evals/readme-check-cases.json', 'utf8'));
  for (const [name, body] of Object.entries(fixture.base)) fs.writeFileSync(path.join(target, name), body);
  // This fixture checks file references only; it is not a rendered screenshot.
  if (task !== 'blocker') fs.writeFileSync(path.join(target, 'assets/result.png'), 'path-check fixture');
  fs.writeFileSync(path.join(target, 'SKILL.md'), '---\nname: acceptance-fixture\ndescription: Use this skill when validating an isolated publication fixture.\nmetadata:\n  version: "0.1.0"\n---\n\n# Fixture\n');
  fs.copyFileSync('LICENSE', path.join(target, 'LICENSE'));
  fs.writeFileSync(path.join(target, '.gitignore'), '.env\nnode_modules/\n.DS_Store\n');
  const before = digestInventory(inventory(target, fs.readdirSync(target)));
  const result = spawnSync(process.execPath, [path.join(installed, 'scripts/publish-check.mjs'), '--json', `--report=${path.join(evidence, `${task}-publish-report.json`)}`],
    { cwd: target, encoding: 'utf8', timeout: 5000 });
  assert.ifError(result.error);
  const report = JSON.parse(result.stdout);
  if (task === 'check-only') {
    assert.equal(result.status, 0, result.stdout);
    assert.equal(report.results.some(r => r.level === 'FAIL'), false);
  } else {
    assert.equal(result.status, 1);
    assert.ok(report.results.some(r => r.level === 'FAIL' && /preview image/.test(r.title)), 'Missing delivery asset must independently block.');
  }
  assert.equal(digestInventory(inventory(target, fs.readdirSync(target))), before, 'Inspection must not modify target files.');
  assert.equal(report.summary.readiness, task === 'blocker' ? 'blocked' : 'review_required');
  console.log(`PASS: ${task}; target unchanged, actual checker exit ${result.status}, no publication executed.`);
} else throw new Error(`Unknown task: ${task}`);
