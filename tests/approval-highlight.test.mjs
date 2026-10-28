import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../approval.html', import.meta.url), 'utf8');

test('approval decision dropdown is highlighted instead of priority', () => {
  assert.match(html, /id="decision" class="control decision-control"/);
  assert.match(html, /\.decision-control\{border-color:var\(--gold\);background:color-mix/);
  assert.match(html, /id="approvalPriority" class="control"/);
  assert.doesNotMatch(html, /id="approvalPriority" class="control severity-control"/);
  assert.doesNotMatch(html, /paintPriority/);
});
