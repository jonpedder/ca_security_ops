import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('measurement tool is inactive when the app loads', () => {
  assert.match(html, /new Measurement\(\{view,container:panel\.querySelector\('\[data-measurement\]'\),activeTool:null\}\)/);
  assert.doesNotMatch(html, /new Measurement\([^\n]*activeTool:'(?:distance|area)'/);
});

test('closing web map analysis restores the standard arrow cursor', () => {
  assert.match(html, /webMapAnalysisExpand\.watch\('expanded',expanded=>\{if\(!expanded\)/);
  assert.match(html, /view\.container\.style\.cursor='default'/);
  assert.match(html, /surface\.style\.cursor='default'/);
});
