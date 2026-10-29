import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const approval = await readFile(new URL('../approval.html', import.meta.url), 'utf8');
const operations = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const workflowSpec = JSON.parse(await readFile(new URL('../workflow/incident-triage.spec.json', import.meta.url), 'utf8'));

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

test('triage queue shows watch area and location followed by description', () => {
  assert.match(approval, /function queueInfo\(j\)/);
  assert.match(approval, /incident_audit\.watch_area/);
  assert.match(approval, /incident_audit\.alert_location/);
  assert.match(approval, /class="job-title">'\+esc\(i\.area\)\+' · '\+esc\(i\.location\)/);
  assert.match(approval, /class="job-description">'\+esc\(i\.description\)/);
  assert.match(approval, /\.job-description\{[^}]*-webkit-line-clamp:2[^}]*line-clamp:2/);
  assert.match(approval, /id="watchArea"[^>]*type="search"[^>]*list="watchAreaOptions"[^>]*aria-label="Search or filter by watch area"/);
  assert.match(approval, /id="location"[^>]*type="search"[^>]*list="locationOptions"[^>]*aria-label="Search or filter by location"/);
  assert.match(approval, /id="watchAreaOptions"/);
  assert.match(approval, /id="locationOptions"/);
  assert.match(approval, /\.filters \.control\{[^}]*font-size:11px/);
  assert.match(approval, /id="dateRange"[^>]*aria-label="Filter by date"/);
  assert.match(approval, /id="activeDateRange"[^>]*>All dates</);
  assert.match(approval, /activeDateRange'\)\.textContent=dateLabel\+' · '\+list\.length\+' '\+\(list\.length===1\?'incident':'incidents'\)/);
  assert.match(approval, /Last 24 hours/);
  assert.match(approval, /Last 7 days/);
  assert.match(approval, /Last 30 days/);
  assert.match(approval, /Last 90 days/);
  assert.match(approval, /<option value="custom">Specific date…<\/option>/);
  assert.match(approval, /id="specificDate"[^>]*type="date"[^>]*hidden/);
  assert.match(approval, /function localDateKey\(time\)/);
  assert.match(approval, /dateMode==='custom'/);
  assert.match(approval, /localDateKey\(created\)===specificDate/);
  assert.match(approval, /specificDate\.hidden=!custom/);
  assert.match(approval, /specificDate'\)\.onchange=renderList/);
  assert.match(approval, /function jobCreatedTime\(value\)/);
  assert.match(approval, /created=jobCreatedTime\(j\.createdDate\)/);
  assert.match(approval, /!cutoff\|\|created>=cutoff/);
  assert.match(approval, /dateRange'\)\.onchange=renderList/);
  assert.match(approval, /id="clearFilters"[^>]*>Clear all filters</);
  assert.match(approval, /clearFilters'\)\.onclick=\(\)=>\{/);
  for(const id of ['search','watchArea','location','dateRange','specificDate','status']) assert.match(approval,new RegExp("\\$\\('"+id+"'\\)\\.value=''"));
  assert.match(approval,/\$\('persona'\)\.value='all'/);
  assert.match(approval, /function updateQueueFilters\(\)/);
  assert.match(approval, /!watchArea\|\|i\.area\.toLowerCase\(\)\.includes\(watchArea\.toLowerCase\(\)\)/);
  assert.match(approval, /!location\|\|i\.location\.toLowerCase\(\)\.includes\(location\.toLowerCase\(\)\)/);
  assert.match(approval, /watchArea'\)\.oninput=renderList/);
  assert.match(approval, /location'\)\.oninput=renderList/);
  assert.doesNotMatch(approval, /class="job-title">'\+esc\(String\(j\.jobName\)/);
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

test('approval lists only jobs status-modified through incident triage', () => {
  assert.match(approval, /jobTemplateId==='FkGUEznHSqWukSFzDxeC4w'/);
  assert.match(approval, /function triageStatusWasModified\(j\)/);
  assert.match(approval, /c\.audit\?\.eventType==='Status Changed'&&c\.audit\?\.field==='Status'/);
  assert.match(approval, /if\(!triageStatusWasModified\(j\)\)return false/);
  assert.match(approval, /state\.details\.clear\(\);state\.queueAttempted\.clear\(\)/);
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


test('approval decision includes Alert in Teams Channel with a No default', () => {
  assert.match(approval, /Alert in Teams Channel<select id="alertstatus"/);
  assert.match(approval, /<option value="No" selected>No<\/option><option value="Yes">Yes<\/option>/);
  assert.match(approval, /extendedProperty\(j,'request_details','alertstatus','No'\)/);
  assert.match(approval, /'request_details.alertstatus':alertstatus\|\|'No'/);
  assert.match(approval, /Teams Channel Status/);
  const requestDetails=workflowSpec.extendedPropertyTables.find(table=>table.tableName==='request_details');
  const field=requestDetails.fields.find(item=>item.propertyName==='alertstatus');
  assert.equal(field.propertyAlias,'Alert in Teams Channel');
  assert.deepEqual(field.domain,['No','Yes']);
});
