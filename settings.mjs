const STORAGE_KEY='mission-insights-settings-v1';
const CHANGE_EVENT='mission-insights-settings-change';

const defaults={
  version:1,
  statusColors:{Submitted:'#8b9bab',New:'#8796a0',Ready:'#6574cd','In Progress':'#f28c28',Investigating:'#f28c28',Monitoring:'#f2c94c',Pending:'#f2c94c','On Hold':'#d9364f',Revised:'#d9364f',Approved:'#36b37e',Completed:'#36b37e',Closed:'#607d8b',Resolved:'#36b37e',Unknown:'#8796a0'},
  personaLabels:{all:'All personas',triage:'Triage Analyst',approver:'Approver',command:'Watch Commander'},
  incidentIcons:{Weather:{style:'original',url:''},Fire:{style:'original',url:''},Flood:{style:'original',url:''},Infrastructure:{style:'original',url:''},Traffic:{style:'original',url:''},Medical:{style:'original',url:''},Security:{style:'original',url:''},Earthquake:{style:'original',url:''},Hazmat:{style:'original',url:''},Other:{style:'original',url:''}},
  labels:{settings:'Settings',signIn:'Sign in with ArcGIS',signOut:'Sign out',operationalBrief:'Operational Brief',incidentApproval:'Incident Approval',zoom:'Zoom',source:'Source',updateIncident:'Update incident',auditTrail:'Audit trail',incidentPdf:'Incident PDF',pdfReport:'PDF report',exportCsv:'Export CSV',exportJson:'Export JSON',operationsMap:'Operations Map',triagePdf:'Triage PDF',refresh:'Refresh',recordDecision:'Record decision',reload:'Reload',drawerOpen:'Open',drawerClose:'Close',expand:'Expand',collapse:'Collapse',fullscreen:'Fullscreen',exitFullscreen:'Exit full screen'},
  tickerSpeed:300,
  refreshMs:30000
};
const clone=v=>JSON.parse(JSON.stringify(v));
function deepFreeze(v){Object.freeze(v);for(const x of Object.values(v))if(x&&typeof x==='object'&&!Object.isFrozen(x))deepFreeze(x);return v}
export const BASE_DEFAULTS=deepFreeze(defaults);
const hex=v=>/^#[0-9a-f]{6}$/i.test(String(v||''));
const safeIconUrl=v=>{if(!v)return'';try{const u=new URL(v,location.href);return u.protocol==='https:'?u.href:''}catch{return''}};
export function validateSettings(input={}){const v=clone(BASE_DEFAULTS),errors=[];for(const [k,c] of Object.entries(input.statusColors||{}))if(k in v.statusColors&&hex(c))v.statusColors[k]=c;for(const [k,s] of Object.entries(input.personaLabels||{}))if(k in v.personaLabels&&String(s).trim())v.personaLabels[k]=String(s).trim().slice(0,60);for(const [k,s] of Object.entries(input.incidentIcons||{})){if(!(k in v.incidentIcons))continue;const style=['original','circle','square','diamond','triangle','cross','x','image'].includes(s?.style)?s.style:'original',url=style==='image'?safeIconUrl(s?.url):'';if(style==='image'&&!url)errors.push(k+' icon requires an HTTPS image URL.');v.incidentIcons[k]={style:style==='image'&&!url?'original':style,url}}for(const [k,s] of Object.entries(input.labels||{}))if(k in v.labels&&String(s).trim())v.labels[k]=String(s).trim().slice(0,80);const speed=Number(input.tickerSpeed);if(Number.isFinite(speed))v.tickerSpeed=Math.min(3600,Math.max(0,speed));const refresh=Number(input.refreshMs);if(Number.isFinite(refresh))v.refreshMs=Math.min(3600000,Math.max(5000,refresh));return{value:v,errors}}
export function loadSettings(){try{return validateSettings(JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')).value}catch{return clone(BASE_DEFAULTS)}}
export function saveSettings(candidate){const checked=validateSettings(candidate);if(checked.errors.length)throw new Error(checked.errors.join(' '));localStorage.setItem(STORAGE_KEY,JSON.stringify(checked.value));window.dispatchEvent(new CustomEvent(CHANGE_EVENT,{detail:checked.value}));return checked.value}
export function resetSettings(){localStorage.removeItem(STORAGE_KEY);const value=clone(BASE_DEFAULTS);window.dispatchEvent(new CustomEvent(CHANGE_EVENT,{detail:value}));return value}
export function subscribeSettings(callback){const custom=e=>callback(e.detail||loadSettings()),storage=e=>{if(e.key===STORAGE_KEY)callback(loadSettings())};window.addEventListener(CHANGE_EVENT,custom);window.addEventListener('storage',storage);return()=>{window.removeEventListener(CHANGE_EVENT,custom);window.removeEventListener('storage',storage)}}
export function applyLabels(root,labels){root.querySelectorAll('[data-label-key]').forEach(el=>{const text=labels[el.dataset.labelKey];if(text)el.textContent=text})}
export function statusColor(settings,status){return settings.statusColors[status]||settings.statusColors.Unknown}
