import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const settingsPage=await readFile(new URL('../settings.html',import.meta.url),'utf8');
const settingsModule=await readFile(new URL('../settings.mjs',import.meta.url),'utf8');
const operations=await readFile(new URL('../index.html',import.meta.url),'utf8');
const approval=await readFile(new URL('../approval.html',import.meta.url),'utf8');

test('settings page exposes all requested configuration sections and reset',()=>{
  for(const text of ['Status colors','Triage persona names','Incident icons','Button labels','Timing','Reset to base defaults']) assert.match(settingsPage,new RegExp(text));
  assert.match(settingsPage,/id="statusColors"/);
  assert.match(settingsPage,/id="personaLabels"/);
  assert.match(settingsPage,/id="incidentIcons"/);
  assert.match(settingsPage,/id="buttonLabels"/);
  assert.match(settingsPage,/Filter defaults/);
  assert.match(settingsPage,/id="defaultIncidentTime"/);
  assert.match(settingsPage,/id="tickerSpeed"[^>]*><option value="300">Slow<\/option><option value="120">Medium<\/option><option value="75">Fast<\/option><option value="40">Faster<\/option><option value="0">Paused<\/option>/);
});

test('settings page has one clean document ending without rendered code remnants',()=>{
  assert.equal((settingsPage.match(/<\/script><\/body><\/html>/g)||[]).length,1);
  assert.ok(settingsPage.trimEnd().endsWith('</script></body></html>'));
});

test('settings includes printable operator help, live screenshots, and approval guidance',()=>{
  for(const text of ['Help &amp; How-to','How to initially triage an incident','How to use Incident Approval','Rejecting or returning incidents','Troubleshooting common approval errors','Quick reference checklist']) assert.match(settingsPage,new RegExp(text));
  assert.match(settingsPage,/id="helpPanel"/);
  assert.match(settingsPage,/id="printHelp"/);
  assert.match(settingsPage,/id="downloadHelpPdf"/);
  assert.match(settingsPage,/Print PDF/);
  assert.match(settingsPage,/function downloadHelpSectionPdf\(id,button\)/);
  assert.match(settingsPage,/downloadHelpSectionPdf\(details\.id,printButton\)/);
  assert.match(settingsPage,/mission-insights-'\+id\.replace/);
  assert.match(settingsPage,/doc\.save\(filename\)/);
  assert.match(settingsPage,/Table of contents/);
  assert.match(settingsPage,/Page '\+page\+' of '\+total/);
  assert.match(settingsPage,/window\.print\(\)/);
  assert.match(settingsPage,/class="print-brand"/);
  assert.match(settingsPage,/async function pdfLogoData\(\)/);
  assert.match(settingsPage,/function drawPdfBrand\(doc,logo\)/);
  assert.match(settingsPage,/drawPdfBrand\(doc,logo\)/);
  assert.match(settingsPage,/help\/operations-map-live\.png/);
  assert.match(settingsPage,/help\/incident-approval-live\.png/);
});

test('main application tab labels are configurable and sections collapse by default',()=>{
  assert.match(settingsModule,/tabLabels:\{operationsMap:'Operations Map',incidentApproval:'Incident Approval'\}/);
  assert.match(settingsModule,/export function applyTabLabels/);
  assert.match(settingsPage,/Main app tab labels/);
  assert.match(settingsPage,/id="tabLabels"/);
  assert.match(settingsPage,/data-tab-label/);
  assert.match(operations,/data-main-tab-key="incidentApproval"/);
  assert.match(approval,/data-main-tab-key="operationsMap"/);
  assert.match(operations,/applyTabLabels\(document,appSettings\.tabLabels\)/);
  assert.match(approval,/applyTabLabels\(document,appSettings\.tabLabels\)/);
  assert.match(settingsPage,/<details class="card"><summary>Status colors<\/summary>/);
  assert.doesNotMatch(settingsPage,/<details class="card" open>/);
});

test('app branding is configurable below settings templates',()=>{
  assert.match(settingsModule,/branding:\{appName:'Mission Insights',subtitle:'A Watch Center Integration',logoUrl:'',basemap:'webmap',colors:/);
  assert.match(settingsModule,/export function applyBranding/);
  assert.match(settingsPage,/Settings templates[\s\S]*App branding[\s\S]*Main app tab labels/);
  for(const id of ['brandingAppName','brandingSubtitle','brandingLogoUrl','brandingLogoUpload','brandingLogoPreview']) assert.match(settingsPage,new RegExp('id="'+id+'"'));
  assert.match(settingsPage,/Uploaded logos must be 300 KB or smaller/);
  assert.match(settingsPage,/Recommended: 88 × 100 px or larger at the same 22:25 aspect ratio/);
  assert.match(settingsPage,/accept="image\/png,image\/jpeg,image\/gif,image\/webp"/);
  assert.match(settingsPage,/Live header previews/);
  for(const label of ['Operations Map','Incident Approval','Settings']) assert.match(settingsPage,new RegExp('branding-preview-label">'+label));
  assert.match(settingsPage,/function updateBrandingDraftPreview\(\)/);
  assert.match(settingsPage,/id="brandingColors"/);
  assert.match(settingsPage,/id="brandingBasemap"/);
  assert.match(settingsPage,/id="basemapThumbnail"/);
  assert.match(settingsPage,/id="basemapThumbnailCaption"/);
  assert.match(settingsPage,/function updateBasemapThumbnail\(\)/);
  assert.match(settingsPage,/let basemapPreviewRequest=0/);
  assert.match(settingsPage,/preload\.onload=/);
  assert.match(settingsPage,/request!==basemapPreviewRequest/);
  assert.match(settingsPage,/data-basemap="hybrid"/);
  assert.match(settingsPage,/brandingBasemap'\)\.onchange=updateBasemapThumbnail/);
  assert.match(settingsPage,/services\.arcgisonline\.com\/ArcGIS\/rest\/services/);
  assert.match(settingsPage,/Web map default/);
  assert.match(settingsPage,/Imagery with labels/);
  assert.match(settingsModule,/basemap:'webmap'/);
  assert.match(operations,/function applyConfiguredBasemap\(\)/);
  assert.match(operations,/originalBasemap=map\.basemap\?\.clone\(\)/);
  assert.match(operations,/applyConfiguredBasemap\(\);state\.tickerSpeed/);
  assert.match(settingsPage,/Theme colors/);
  assert.match(settingsPage,/data-branding-color/);
  for(const color of ['Header','Page background','Panel','Panel alternate','Accent and buttons','Primary text','Muted text','Borders']) assert.match(settingsPage,new RegExp(color));
  assert.match(settingsModule,/style\.setProperty\(cssVar,colors\[key\]\)/);
  assert.match(settingsPage,/brandingAppName'\)\.oninput=updateBrandingDraftPreview/);
  assert.match(settingsPage,/brandingSubtitle'\)\.oninput=updateBrandingDraftPreview/);
  assert.match(operations,/applyBranding\(document,appSettings\.branding\)/);
  assert.match(approval,/applyBranding\(document,appSettings\.branding\)/);
});

test('severity colors are configurable and applied across operations and approval',()=>{
  assert.match(settingsModule,/severityColors:\{Critical:'#d9364f',High:'#f28c28',Medium:'#f2c94c',Low:'#36b37e',Unknown:'#8796a0'\}/);
  assert.match(settingsModule,/Object\.entries\(input\.severityColors\|\|\{\}\)/);
  assert.match(settingsPage,/Status colors[\s\S]*Severity Colors[\s\S]*Triage persona names/);
  assert.match(settingsPage,/id="severityColors"/);
  assert.match(settingsPage,/data-severity-color/);
  assert.match(settingsPage,/next\.severityColors\[e\.dataset\.severity\]=e\.value/);
  assert.match(operations,/let colors=appSettings\.severityColors/);
  assert.match(operations,/Object\.assign\(colors,appSettings\.severityColors\)/);
  assert.match(operations,/--c:'\+colors\[x\]/);
  assert.match(operations,/--sev:'\+colors\[d\.severity\]/);
  assert.match(approval,/severityColor=s=>appSettings\.severityColors\[s\]/);
  assert.match(approval,/class="control severity-control"/);
  assert.match(approval,/paintPriority/);
});

test('incident time filter default is configurable below main app tab labels',()=>{
  assert.match(settingsModule,/filterDefaults:\{incidentTimeHours:0\.5\}/);
  assert.match(settingsModule,/\[0\.5,1,2,4,12,24,168\]\.includes\(incidentTimeHours\)/);
  assert.match(settingsPage,/Main app tab labels[\s\S]*Filter defaults[\s\S]*Status colors/);
  assert.match(settingsPage,/next\.filterDefaults\.incidentTimeHours=Number\(\$\('defaultIncidentTime'\)\.value\)/);
  assert.match(operations,/hours:appSettings\.filterDefaults\.incidentTimeHours/);
});

test('shared settings preserve immutable base defaults and versioned storage',()=>{
  assert.match(settingsModule,/export const BASE_DEFAULTS=deepFreeze/);
  assert.match(settingsModule,/version:1/);
  assert.match(settingsModule,/localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.match(settingsModule,/function validate/);
});

test('settings support direct symbol upload with a live preview before save',()=>{
  assert.match(settingsPage,/data-icon-upload/);
  assert.match(settingsPage,/accept="'\+ICON_UPLOAD_TYPES/);
  assert.match(settingsPage,/function updatePreview\(kind\)/);
  assert.match(settingsPage,/symbol loaded for preview\. Save settings to apply it/);
  assert.match(settingsModule,/MAX_ICON_UPLOAD_BYTES/);
  assert.match(settingsModule,/data:image\\\/\(\?:png\|jpeg\|gif\|webp\)/);
});

test('settings templates can be exported and imported for preview before saving',()=>{
  assert.match(settingsPage,/id="exportTemplate"/);
  assert.match(settingsPage,/id="importTemplate"/);
  assert.match(settingsPage,/mission-insights-settings-template\.json/);
  assert.match(settingsPage,/Template imported for preview\. Click Save settings to apply it/);
  assert.match(settingsPage,/validateSettings\(parsed\)/);
});

test('operations and approval pages both link to and consume shared settings',()=>{
  assert.match(operations,/href="\.\/settings\.html"/);
  assert.match(approval,/href="\.\/settings\.html"/);
  assert.match(operations,/loadSettings,subscribeSettings,applyLabels/);
  assert.match(approval,/loadSettings,subscribeSettings,applyLabels/);
  assert.match(operations,/appSettings\.refreshMs/);
  assert.match(operations,/tickerSpeed:appSettings\.tickerSpeed/);
  assert.match(approval,/appSettings\.personaLabels/);
  assert.match(approval,/appSettings\.statusColors/);
});
