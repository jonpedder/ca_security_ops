import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('clicks inside incident triage do not clear the selected incident', () => {
  assert.match(
    html,
    /!e\.target\.closest\('\.card,\.right,\.esri-popup'\)/,
    'the document click-away handler must exclude the right-side triage panel and popup'
  );
});

test('new triage jobs retain creation state through submission', () => {
  assert.match(
    html,
    /createdNew=!t;if\(!t\)/,
    'saveTriage must define createdNew before the new-job branch uses it'
  );
});
