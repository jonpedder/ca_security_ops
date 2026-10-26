import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const operations=await readFile(new URL('../index.html',import.meta.url),'utf8');

test('severity distribution rows filter the incident list and map',()=>{
  assert.match(operations,/data-severity=/);
  assert.match(operations,/state\.severity=same\?\[\]:\[selected\]/);
  assert.match(operations,/layerView\.filter=\{objectIds:state\.filtered\.map\(d=>d\.oid\)\}/);
  assert.match(operations,/class="dist-row'\+\(active\?' active':'\'\)/);
  assert.match(operations,/aria-pressed=/);
});
