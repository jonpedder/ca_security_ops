import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('clicks inside incident triage or popup controls do not clear the selected incident', () => {
  assert.match(
    html,
    /!e\.target\.closest\('\.card,\.right,\.esri-popup,\.esri-popup__button'\)/,
    'the document click-away handler must exclude the triage panel, popup, and popup close controls'
  );
});

test('new triage jobs retain creation state through submission', () => {
  assert.match(
    html,
    /createdNew=!t;if\(!t\)/,
    'saveTriage must define createdNew before the new-job branch uses it'
  );
});

test('map popup exposes the standard dock and undock control', () => {
  assert.match(html, /popup:\{dockEnabled:false,dockOptions:\{position:'bottom-right',buttonEnabled:true\}\}/);
});

test('Home and bookmark viewpoints use the ArcGIS Viewpoint targetGeometry property', () => {
  assert.match(html, /const californiaViewpoint=\{targetGeometry:\{xmin:-124\.6/);
  assert.doesNotMatch(html, /viewpoint:\{target:\{/);
});

test('operations map loads its layers and styling from the saved Web Map item', () => {
  assert.match(html, /const WEBMAP_ID='7158f6e6b09d4ff4b3cbae7c9410747f'/);
  assert.match(html, /new WebMap\(\{portalItem:\{id:WEBMAP_ID,portal:\{url:PORTAL\}\}\}\)/);
  assert.match(html, /layer=map\.layers\.find\(x=>x\.title==='Watch Alerts'\)/);
  assert.match(html, /watchAreasLayer=map\.layers\.find\(x=>x\.title==='Watch Areas'\)/);
  assert.doesNotMatch(html, /new FeatureLayer\(/);
  assert.doesNotMatch(html, /new Map\(\{basemap:/);
});

test('operations-map triage pane provides a single-incident PDF report', () => {
  assert.match(html, /id="triagePdfBtn"/);
  assert.match(html, /function exportIncidentTriagePdf/);
  assert.match(html, /state\.audit=await auditData\(d\);await exportAuditPdf\(\)/);
  assert.match(html, /src="\.\/vendor\/jspdf\.umd\.min\.js"/);
});

test('audit trail converts structured comments to human-readable entries', () => {
  assert.match(html, /text\.startsWith\('AUDIT_JSON:'\)/);
  assert.match(html, /text\.startsWith\('INCIDENT_JSON:'\)/);
  assert.match(html, /eventType:'Incident Registered'/);
  assert.match(html, /incidentAuditSummary\(p\)/);
  assert.doesNotMatch(
    html,
    /note:p\.note\|\|c\.comment/,
    'structured comments must not fall back to displaying raw JSON'
  );
});
