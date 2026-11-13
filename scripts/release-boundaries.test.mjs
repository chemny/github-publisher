#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { candidateDigest } from './candidate-review.mjs';
const checker=fileURLToPath(new URL('./publish-check.mjs',import.meta.url));
function fixture(fn){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'publisher-boundary-'));
 const git=(...args)=>{const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
 const scan=(...args)=>{const r=spawnSync(process.execPath,[checker,'--json','--no-report',...args],{cwd:root,encoding:'utf8'});assert.ok(r.stdout,r.stderr);return JSON.parse(r.stdout);};
 const put=(f,s)=>{fs.mkdirSync(path.dirname(path.join(root,f)),{recursive:true});fs.writeFileSync(path.join(root,f),s);};
 try{git('init');git('config','user.name','Synthetic Fixture');git('config','user.email','fixture@example.invalid');
 put('SKILL.md','---\nname: fixture\ndescription: Use when checking a synthetic fixture.\n---\n');put('README.md','# Fixture');put('README.zh.md','# 样例');put('scripts/task.mjs','export const value=1;');git('add','.');git('commit','-m','baseline');
 fn({root,git,scan,put,base:git('rev-parse','HEAD')});
 }finally{fs.rmSync(root,{recursive:true,force:true});}
}
const has=(r,t)=>r.results.some(x=>x.title===t);
test('committed edits and deletions both require README impact review',()=>fixture(({git,scan,put,base})=>{
 put('scripts/task.mjs','export const value=2;');git('add','.');git('commit','-m','change');assert.ok(has(scan('--base='+base),'README sync review required'));
 git('rm','scripts/task.mjs');git('commit','-m','delete');assert.ok(has(scan('--base='+base),'README sync review required'));
 assert.ok(has(scan('--base=unknown-ref'),'Invalid release baseline'));assert.ok(has(scan(),'Release baseline unavailable'));
}));
test('Chinese and leading-space filenames remain scanned',()=>fixture(({put,scan})=>{
 for(const f of ['中文材料.txt',' leading.txt']){put(f,'sk-'+'a'.repeat(32));assert.ok(scan().results.some(x=>x.title.startsWith('Possible secret:')&&x.detail===f),f);}
}));
test('ignored reports do not drift digest but tracked ignored files do',()=>fixture(({root,git,put})=>{
 put('.gitignore','local.json\n');const a=candidateDigest(root);put('local.json','one');assert.equal(candidateDigest(root),a);git('add','-f','local.json');const b=candidateDigest(root);assert.notEqual(b,a);put('local.json','two');assert.notEqual(candidateDigest(root),b);
}));
test('no-report preserves payload and visibility is explicit',()=>fixture(({root,scan})=>{
 const a=candidateDigest(root);assert.ok(has(scan(),'Visibility not specified'));assert.equal(candidateDigest(root),a);assert.equal(fs.existsSync(path.join(root,'publish-check-report.json')),false);assert.equal(has(scan('--visibility=public'),'Visibility not specified'),false);
}));
test('missing Git is reported',()=>fixture(({root})=>{
 const bin=path.join(root,'empty-bin');fs.mkdirSync(bin);const r=spawnSync(process.execPath,[checker,'--json','--no-report'],{cwd:root,encoding:'utf8',env:{...process.env,PATH:bin}});assert.ok(has(JSON.parse(r.stdout),'Git unavailable'));
}));
function plainProject(fn){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'publisher-generic-'));
 try{fs.writeFileSync(path.join(root,'README.md'),'# Tool\n\nA command-line tool.\n');fs.writeFileSync(path.join(root,'LICENSE'),'Synthetic license placeholder\n');fs.writeFileSync(path.join(root,'.gitignore'),'node_modules/\n.DS_Store\n');
 const scan=(...args)=>{const r=spawnSync(process.execPath,[checker,'--json','--no-report','--visibility=public',...args],{cwd:root,encoding:'utf8'});assert.ok(r.stdout,r.stderr);return {code:r.status,report:JSON.parse(r.stdout)};};
 fn({root,scan});}finally{fs.rmSync(root,{recursive:true,force:true});}
}
test('generic profile passes a plain project but keeps safety scans',()=>plainProject(({root,scan})=>{
 const blocked=scan();assert.equal(blocked.code,1);assert.ok(has(blocked.report,'Missing required file'));
 const ok=scan('--profile=generic');assert.equal(ok.code,0,JSON.stringify(ok.report.results));assert.equal(ok.report.summary.profile,'generic');
 fs.writeFileSync(path.join(root,'config.txt'),'sk-'+'a'.repeat(32));
 const secret=scan('--profile=generic');assert.equal(secret.code,1);assert.ok(secret.report.results.some(x=>x.title.startsWith('Possible secret:')));
 fs.rmSync(path.join(root,'config.txt'));fs.rmSync(path.join(root,'LICENSE'));
 assert.equal(scan('--profile=generic').code,1);
 assert.ok(has(scan('--profile=bogus').report,'Invalid profile'));
}));
