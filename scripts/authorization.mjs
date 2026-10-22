#!/usr/bin/env node
// A testable decision model, not a runtime permission interceptor or consent store.
export function authorizeAction({ mode, action, scope, confirmation, held = false }) {
  const deny = reason => ({ allowed: false, reason });
  const text = value => typeof value === 'string' && Boolean(value.trim());
  if (!['inspect', 'edit', 'publish'].includes(mode)) return deny('Unknown request mode.');
  if (action === 'inspect') return { allowed: true, reason: 'Read-only inspection.' };
  if (held) return deny('The user has put execution or publication on hold.');
  if (action === 'edit' || action === 'commit') {
    return mode === 'inspect' ? deny('Discussion and inspection do not authorize edits or commits.')
      : { allowed: true, reason: 'Local work is authorized; no remote operation.' };
  }
  const remoteActions = ['push', 'create-repository', 'update-metadata', 'create-release'];
  if (!remoteActions.includes(action)) return deny('Unknown action; fail closed.');
  if (mode !== 'publish') return deny('A local-only request does not authorize remote operations.');
  if (!scope || !['repository', 'branch', 'visibility', 'candidateDigest'].every(k => typeof scope[k] === 'string' && scope[k].trim()) ||
      !Array.isArray(scope.commits) || !scope.commits.length || scope.commits.some(s => typeof s !== 'string' || !s.trim())) {
    return deny('Provide the concrete repository, branch, visibility, candidate digest and commit list.');
  }
  if (action === 'create-release' && (!text(scope.tag) || !text(scope.releaseCommit))) return deny('A Release needs its exact tag and commit.');
  if (confirmation?.explicit !== true || !text(confirmation.evidenceRef) || !text(confirmation.userQuote)) {
    return deny('An explicit human confirmation of the displayed scope is required.');
  }
  if (!Array.isArray(confirmation.actions) || !confirmation.actions.includes(action)) return deny('This action was not confirmed.');
  const approved = confirmation.scope;
  const fields = ['repository', 'branch', 'visibility', 'candidateDigest', 'tag', 'releaseCommit'];
  if (!approved || fields.some(k => approved[k] !== scope[k]) ||
      JSON.stringify(approved.commits) !== JSON.stringify(scope.commits)) return deny('The confirmed scope has changed.');
  return { allowed: true, reason: 'The explicit confirmation matches the action and scope.' };
}
