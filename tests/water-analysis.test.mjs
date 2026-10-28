import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('map analysis includes downstream trace and watershed tools with credit confirmation', () => {
  assert.match(html, /<option value="downstream">Trace downstream \(credits\)<\/option>/);
  assert.match(html, /<option value="watershed">Delineate watershed \(credits\)<\/option>/);
  assert.match(html, /creditTool=tool\.value==='drive'\|\|isHydrology\(\)/);
  assert.match(html, /\(tool\.value==='drive'\?'Drive-time':'Hydrology'\)\+' analysis uses an ArcGIS premium service and may consume organizational credits/);
});

test('hydrology tools use exact asynchronous task and output names', () => {
  assert.match(html, /tool\.value==='downstream'\?'TraceDownstream':'Watershed'/);
  assert.match(html, /InputPoints:inputPoints,PointIDField:'Name',DataSourceResolution:resolution\.value,Generalize:true/);
  assert.match(html, /params\.SnapDistance='';params\.SnapDistanceUnits='Meters';params\.ReturnSnappedPoints=true/);
  assert.match(html, /await job\.waitForJobCompletion/);
  assert.match(html, /tool\.value==='downstream'\?'OutputTraceLine':'WatershedArea'/);
  assert.match(html, /job\.fetchResultData\('SnappedPoints'\)/);
  assert.match(html, /hydro\.arcgis\.com\/arcgis\/rest\/services\/Tools\/Hydrology\/GPServer\/'\+task/);
});
