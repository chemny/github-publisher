#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { authorizeAction } from './authorization.mjs';

const scope = { repository: 'https://example.com/owner/skill.git', branch: 'main', visibility: 'public',
  candidateDigest: 'candidate-a', commits: ['commit-a', 'commit-b'] };
const approval = { explicit: true, userQuote: 'Confirm the listed push.', evidenceRef: 'fixture-turn', actions: ['push'], scope };

test('inspect-only cannot edit, commit or execute remote operations', () => {
  assert.equal(authorizeAction({ mode: 'inspect', action: 'inspect' }).allowed, true);
  for (const action of ['edit', 'commit', 'push', 'create-repository', 'update-metadata', 'create-release'])
    assert.equal(authorizeAction({ mode: 'inspect', action, scope, confirmation: approval }).allowed, false, action);
});
test('edit-only permits local changes and local commits but never remote operations', () => {
  for (const action of ['edit', 'commit']) assert.equal(authorizeAction({ mode: 'edit', action }).allowed, true);
  for (const action of ['push', 'create-repository', 'update-metadata', 'create-release'])
    assert.equal(authorizeAction({ mode: 'edit', action, scope, confirmation: approval }).allowed, false);
});
test('modify-and-publish intent still pauses before concrete push confirmation', () => {
  assert.equal(authorizeAction({ mode: 'publish', action: 'push', scope }).allowed, false);
  assert.equal(authorizeAction({ mode: 'publish', action: 'push', scope, confirmation: approval }).allowed, true);
});
test('scope changes invalidate confirmation, while unchanged scope reuses it', () => {
  for (const change of [{ branch: 'other' }, { repository: 'https://example.com/other.git' }, { visibility: 'private' },
    { commits: ['commit-b', 'commit-a'] }, { commits: ['commit-c'] }, { candidateDigest: 'candidate-b' }])
    assert.equal(authorizeAction({ mode: 'publish', action: 'push', scope: { ...scope, ...change }, confirmation: approval }).allowed, false);
  assert.equal(authorizeAction({ mode: 'publish', action: 'push', scope, confirmation: { ...approval, explicit: false } }).allowed, false);
  assert.equal(authorizeAction({ mode: 'publish', action: 'push', scope, confirmation: approval, held: true }).allowed, false);
});
test('push does not authorize a Release; a separate action and tag/commit are required', () => {
  assert.equal(authorizeAction({ mode: 'publish', action: 'create-release', scope, confirmation: approval }).allowed, false);
  const releaseScope = { ...scope, tag: 'v0.1.0', releaseCommit: 'commit-b' };
  assert.equal(authorizeAction({ mode: 'publish', action: 'create-release', scope: releaseScope,
    confirmation: { ...approval, scope: releaseScope, actions: ['push', 'create-release'] } }).allowed, true);
});
test('unknown actions and missing scope or evidence fail closed', () => {
  assert.equal(authorizeAction({ mode: 'publish', action: 'delete-repository', scope, confirmation: approval }).allowed, false);
  assert.equal(authorizeAction({ mode: 'publish', action: 'push', scope: { ...scope, commits: [] }, confirmation: approval }).allowed, false);
  assert.equal(authorizeAction({ mode: 'publish', action: 'push', scope, confirmation: { ...approval, evidenceRef: '' } }).allowed, false);
});
test('active workflow documents do not retain unconditional no-second-confirmation rules', () => {
  for (const rel of ['SKILL.md', 'references/pre-publish-flow.md', 'references/update-workflow.md', 'references/github-workflow.md', 'references/publish-checklist.md']) {
    const body = fs.readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
    assert.doesNotMatch(body, /without (?:asking|a second confirmation)|do not ask for a second confirmation|publishing proceeded after successful checks without/i, rel);
    assert.match(body, /authorization\.md/, rel);
  }
});
