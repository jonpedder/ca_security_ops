import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const operations=await readFile(new URL('../index.html',import.meta.url),'utf8');

test('severity distribution rows support multi-select filtering of the incident list and map',()=>{
  assert.match(operations,/data-severity=/);
  assert.match(operations,/state\.severity\.includes\(selected\)\?state\.severity\.filter\(x=>x!==selected\):\[\.\.\.state\.severity,selected\]/);
  assert.match(operations,/layerView\.filter=\{objectIds:state\.filtered\.map\(d=>d\.oid\)\}/);
  assert.match(operations,/active=state\.severity\.includes\(x\)/);
  assert.match(operations,/aria-pressed=/);
  assert.match(operations,/Add '\+x\+' to severity filter/);
});
