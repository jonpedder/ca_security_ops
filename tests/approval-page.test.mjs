import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const approval = await readFile(new URL('../approval.html', import.meta.url), 'utf8');
const operations = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('operations page links to the incident approval page', () => {
  assert.match(operations, /href="\.\/approval\.html"/);
});

test('approval page lists ALERT workflow jobs and exposes persona filters', () => {
  assert.match(approval, /jobName LIKE 'ALERT_%'/);
  assert.match(approval, /id="persona"/);
  assert.match(approval, /Triage Analyst/);
  assert.match(approval, /Approver/);
  assert.match(approval, /Watch Commander/);
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
});
