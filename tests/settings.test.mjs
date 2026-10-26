import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const settingsPage=await readFile(new URL('../settings.html',import.meta.url),'utf8');
const settingsModule=await readFile(new URL('../settings.mjs',import.meta.url),'utf8');
const operations=await readFile(new URL('../index.html',import.meta.url),'utf8');
const approval=await readFile(new URL('../approval.html',import.meta.url),'utf8');

test('settings page exposes all requested configuration sections and reset',()=>{
  for(const text of ['Status colors','Triage persona names','Incident icons','Button labels','Timing','Reset to base defaults']) assert.match(settingsPage,new RegExp(text));
  assert.match(settingsPage,/id="statusColors"/);
  assert.match(settingsPage,/id="personaLabels"/);
  assert.match(settingsPage,/id="incidentIcons"/);
  assert.match(settingsPage,/id="buttonLabels"/);
});

test('shared settings preserve immutable base defaults and versioned storage',()=>{
  assert.match(settingsModule,/export const BASE_DEFAULTS=deepFreeze/);
  assert.match(settingsModule,/version:1/);
  assert.match(settingsModule,/localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.match(settingsModule,/function validate/);
});

test('operations and approval pages both link to and consume shared settings',()=>{
  assert.match(operations,/href="\.\/settings\.html"/);
  assert.match(approval,/href="\.\/settings\.html"/);
  assert.match(operations,/loadSettings,subscribeSettings,applyLabels/);
  assert.match(approval,/loadSettings,subscribeSettings,applyLabels/);
  assert.match(operations,/appSettings\.refreshMs/);
  assert.match(operations,/tickerSpeed:appSettings\.tickerSpeed/);
  assert.match(approval,/appSettings\.personaLabels/);
  assert.match(approval,/appSettings\.statusColors/);
});
