#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
export function gitFiles(root) {
 return [...new Set(execFileSync('git', ['ls-files','--cached','--others','--exclude-standard','-z'], {cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).split('\0').filter(Boolean))];
}
