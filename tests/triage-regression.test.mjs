import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('application branding uses configurable app name, subtitle, and logo', () => {
  assert.match(html, /<title>Mission Insights<\/title>/);
  assert.match(html, /data-branding="appName">Mission Insights<\/h1><p data-branding="subtitle">A Watch Center Integration<\/p>/);
  assert.match(html, /data-branding-logo/);
  assert.match(html, /applyBranding\(document,appSettings\.branding\)/);
});

test('header shows the authenticated ArcGIS username and full name', () => {
  assert.match(html, /id="authFullName"/);
  assert.match(html, /id="authUsername"/);
  assert.match(html, /import Portal from/);
  assert.match(html, /user\?\.fullName\|\|username/);
  assert.match(html, /user\?\.username\|\|username/);
  assert.match(html, /await loadAuthenticatedUser\(\)/);
});

test('mobile header keeps authenticated identity visible without desktop controls', () => {
  assert.match(html, /grid-template-columns:32px minmax\(90px,1fr\) 105px 62px/);
  assert.match(html, /\.status-row\{display:contents\}/);
  assert.match(html, /\.clocks,\.badge,\.brief-btn,\.health,\.status-row>a\{display:none\}/);
  assert.match(html, /\.user-identity\{min-width:0;max-width:105px;text-align:right\}/);
});

test('incident list uses the configured default time filter', () => {
  assert.match(html, /state=\{search:'',severity:\[\],category:\[\],source:\[\],hours:appSettings\.filterDefaults\.incidentTimeHours,/);
  assert.match(html, /<option value="0\.5">Last 30 minutes<\/option><option value="1">Last 1 hour<\/option>/);
  assert.match(html, /\$\('timeFilter'\)\.value=String\(state\.hours\)/);
});

test('multi-select filters can collapse to preserve incident list space', () => {
  assert.match(html, /<details class="filter-details" id="advancedFilters"><summary>Severity, category, and source filters<\/summary>/);
  assert.match(html, /<select id="severityFilter"[^>]+multiple/);
  assert.match(html, /<select id="categoryFilter"[^>]+multiple/);
  assert.doesNotMatch(html, /<details class="filter-details" id="advancedFilters" open>/);
});

test('source filter is multi-select, data-driven, and applied to incident filtering', () => {
  assert.match(html, /<select id="sourceFilter"[^>]+multiple/);
  assert.match(html, /sources=\[\.\.\.new Set\(incidents\.map\(d=>d\.source\)\)\]\.sort\(\)/);
  assert.match(html, /state\.source=state\.source\.filter\(s=>sources\.includes\(s\)\)/);
  assert.match(html, /!state\.source\.length\|\|state\.source\.includes\(d\.source\)/);
  assert.match(html, /\$\('sourceFilter'\)\.onchange=e=>\{state\.source=multiValues\(e\.target\)/);
});

test('app uses global rather than statewide monitoring terminology', () => {
  assert.match(html, /Global Situational Awareness/);
  assert.match(html, /Global monitoring active/);
  assert.doesNotMatch(html, /Statewide|statewide/);
});

test('clicks inside incident triage or popup controls do not clear the selected incident', () => {
  assert.match(
    html,
    /!e\.target\.closest\('\.card,\.right,\.esri-popup,\.esri-popup__button'\)/,
    'the document click-away handler must exclude the triage panel, popup, and popup close controls'
  );
});

test('automatic alert refresh preserves in-progress triage form work', () => {
  assert.match(html, /el\.dataset\.incidentId=d\?\.id\|\|''/);
  assert.match(
    html,
    /if\(\$\('details'\)\.dataset\.incidentId!==\(state\.selectedId\|\|''\)\)renderDetails\(\)/,
    'refresh must not rebuild the selected incident pane when its incident has not changed'
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

test('initial triage claims a newly created group-assigned job before updating it', () => {
  assert.match(
    html,
    /const createdJob=await wf\('jobs\/'\+t\.jobId\+'\?extProps=true'\);await claimCurrentSteps\(createdJob\);await Promise\.all\(\[wf\('jobs\/'\+t\.jobId\+'\/update'/,
    'new jobs must be claimed before the first status update'
  );
});

test('triage only reuses jobs created from the current audited template', () => {
  assert.match(html, /fields:\['jobId','jobName','jobStatus','priority','closed','createdDate','jobTemplateId'\]/);
  assert.match(html, /x\.jobTemplateId===WFM_TEMPLATE/);
});

test('alerts enter the triage queue only through explicit operations-map triage', () => {
  assert.doesNotMatch(html, /createSubmittedTriage|queueSubmittedIncidents/);
  assert.doesNotMatch(html, /newIncidents=state\.seenAlertIds/);
  assert.match(html, /\$\('saveTriage'\)\.onclick=\(\)=>coordinateIncidentMutation\(d\.id,\(\)=>saveTriage\(d\)\)/);
  assert.match(html, /if\(!t\)\{const body=\{numberOfJobs:1/);
  assert.doesNotMatch(html, /createSubmittedTriage|queueSubmittedIncidents/);
});

test('only the manual saveTriage path can create a workflow job', () => {
  assert.equal((html.match(/jobTemplates\/'\+WFM_TEMPLATE\+'\/job/g) || []).length, 1);
  assert.match(html, /async function saveTriage\(d\)/);
});

test('alert refresh never creates Workflow Manager jobs', () => {
  const loadAlerts = html.match(/async function loadAlerts\(force=false\)\{[\s\S]*?function updateCountdown/)?.[0] || '';
  assert.ok(loadAlerts, 'loadAlerts function should be present');
  assert.doesNotMatch(loadAlerts, /jobTemplates|createSubmittedTriage|queueSubmittedIncidents/);
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
  assert.match(html, /const severityLine=\(label,value,suffix=''\)=>/);
  assert.match(html, /const color=colors\[value\]\|\|colors\.Unknown/);
  assert.match(html, /severityLine\('Current priority',a\.job\.priority/);
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
