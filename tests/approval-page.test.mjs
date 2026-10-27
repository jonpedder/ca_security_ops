import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const approval = await readFile(new URL('../approval.html', import.meta.url), 'utf8');
const operations = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('operations page links to the incident approval page', () => {
  assert.match(operations, /href="\.\/approval\.html"/);
});

test('refresh and triage PDF actions are right-aligned in the workflow queue header', () => {
  const headerActions=approval.match(/<div class="header-actions">(.*?)<\/div><\/header>/)?.[1]||'';
  assert.doesNotMatch(headerActions, /id="(?:refresh|allPdf)"/);
  assert.match(approval, /class="panel-head-row"[^]*?class="queue-actions"><button id="refresh"[^]*?<button id="allPdf"/);
  assert.match(approval, /\.panel-head-row\{[^}]*justify-content:space-between/);
  assert.match(approval, /\.queue-actions\{[^}]*display:flex[^}]*gap:8px/);
});

test('approval page lists ALERT workflow jobs and exposes persona filters', () => {
  assert.match(approval, /jobName LIKE 'ALERT_%'/);
  assert.match(approval, /id="persona"/);
  assert.match(approval, /Triage Analyst/);
  assert.match(approval, /Approver/);
  assert.match(approval, /Watch Commander/);
});

test('triage list color-codes each workflow status icon', () => {
  assert.match(approval, /appSettings\.statusColors\[s\]/);
  assert.match(approval, /class="status-icon"/);
  assert.match(approval, /\.status-icon\{[^}]*background:var\(--status-color\)/);
  assert.match(approval, /\.pill\{[^}]*color:var\(--status-color\)/);
});

test('loading triaged incidents status is red only while loading', () => {
  assert.match(approval, /#updated\.loading\{color:#ff4d5f;font-weight:700\}/);
  assert.match(approval, /classList\.add\('loading'\)/);
  assert.match(approval, /classList\.remove\('loading'\)/);
});

test('approval status filter defaults to Submitted on initial load', () => {
  assert.match(approval, /statusInitialized:false/);
  assert.match(approval, /current=state\.statusInitialized\?sel\.value:'Submitted'/);
  assert.match(approval, /state\.statusInitialized=true/);
});

test('approval submission updates Workflow Manager and writes an audit comment', () => {
  assert.match(approval, /jobs\/'\+job\.jobId\+'\/update/);
  assert.match(approval, /Approval Decision/);
  assert.match(approval, /AUDIT_JSON:/);
  assert.match(approval, /An approval note is required/);
});

test('approval claims the current step before updating the job', () => {
  assert.match(approval, /async function claimCurrentSteps\(job\)/);
  assert.match(approval, /await claimCurrentSteps\(current\)/);
});

test('approval lists only jobs from the current audited template', () => {
  assert.match(approval, /jobTemplateId==='FkGUEznHSqWukSFzDxeC4w'/);
});

test('approval page provides incident and active-triage PDF reports', () => {
  assert.match(approval, /src="\.\/vendor\/jspdf\.umd\.min\.js"/);
  assert.doesNotMatch(approval, /jspdf\/2\.5\.2/);
  assert.match(approval, /id="incidentPdf"/);
  assert.match(approval, /id="allPdf"/);
  assert.match(approval, /function exportIncidentPdf/);
  assert.match(approval, /function exportAllTriagePdf/);
  assert.match(approval, /!j\.closed&&!\['Completed','Closed','Resolved'\]\.includes\(j\.jobStatus\)/);
  assert.match(approval, /Triage and Approval History/);
  assert.match(approval, /const severityLine=\(label,value\)=>/);
  assert.match(approval, /const color=severityColor\(value\)/);
  assert.match(approval, /p\.severityLine\('Priority',j\.priority\|\|'Unknown'\)/);
  assert.match(approval, /async function pdfLogoData\(\)/);
  assert.match(approval, /function drawPdfBrand\(doc,logo\)/);
  assert.match(approval, /drawPdfBrand\(doc,logo\)/);
});
