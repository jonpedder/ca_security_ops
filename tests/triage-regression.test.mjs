import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('application branding uses the Mission Insights title and subtitle', () => {
  assert.match(html, /<title>Mission Insights<\/title>/);
  assert.match(html, /<div class="brand"><h1>Mission Insights<\/h1><p>A Watch Center Integration<\/p><p class="powered-by">Powered by ArcGIS Velocity and Workflow Manager<\/p><\/div>/);
});

test('multi-select filters can collapse to preserve incident list space', () => {
  assert.match(html, /<details class="filter-details" id="advancedFilters"><summary>Severity and category filters<\/summary>/);
  assert.match(html, /<select id="severityFilter"[^>]+multiple/);
  assert.match(html, /<select id="categoryFilter"[^>]+multiple/);
  assert.doesNotMatch(html, /<details class="filter-details" id="advancedFilters" open>/);
});

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
    /createdNew=!t;/,
    'saveTriage must define createdNew before the new-job branch uses it'
  );
  assert.match(html, /if\(!t\)\{const body=/);
});

test('triage claims group-assigned current steps before updating a job', () => {
  assert.match(html, /async function claimCurrentSteps\(job\)/);
  assert.match(html, /assignedType:'User',assignedTo:state\.credential\.userId/);
  assert.match(html, /if\(before\)await claimCurrentSteps\(before\)/);
});

test('triage only reuses jobs created from the current audited template', () => {
  assert.match(html, /fields:\['jobId','jobName','jobStatus','priority','closed','createdDate','jobTemplateId'\]/);
  assert.match(html, /x\.jobTemplateId===WFM_TEMPLATE/);
});

test('new records entering the incident list are submitted to the triage queue', () => {
  assert.match(html, /newIncidents=state\.seenAlertIds\?incidents\.filter/);
  assert.match(html, /queueSubmittedIncidents\(newIncidents\)/);
  assert.match(html, /async function createSubmittedTriage\(d\)/);
  assert.match(html, /jobStatus:'Submitted'/);
  assert.match(html, /Automatically submitted when the alert entered the incident list/);
});

test('initial page load does not backfill every visible alert as a new submission', () => {
  assert.match(html, /newIncidents=state\.seenAlertIds\?incidents\.filter\(d=>!state\.seenAlertIds\.has\(d\.id\)\):\[\]/);
});

test('map popup exposes the standard dock and undock control', () => {
  assert.match(html, /popup:\{dockEnabled:false,dockOptions:\{position:'bottom-right',buttonEnabled:true\}\}/);
});

test('Home and bookmark navigation use valid ArcGIS geometries and viewpoints', () => {
  assert.match(html, /import Extent from/);
  assert.match(html, /import Viewpoint from/);
  assert.match(html, /californiaExtent=extent\(-124\.6,32\.4,-114\.0,42\.1\)/);
  assert.match(html, /home=new Home\(\{view,viewpoint:new Viewpoint\(\{targetGeometry:californiaExtent\}\)\}\)/);
  assert.match(html, /viewpoint:\{targetGeometry:extent\(-124\.6,36\.8,-119\.0,42\.1\)\}/);
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
