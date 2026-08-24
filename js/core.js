const APP_KEY='costlab-calculator-v1';
const SNAP_KEY='costlab-calculator-snapshot-v1';
const uid=()=>crypto.randomUUID?.()||('id-'+Date.now()+'-'+Math.random().toString(16).slice(2));
const n=v=>Number(v)||0;
const pct=v=>Math.max(0,Math.min(99.99,n(v)))/100;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

const translations={
 fr:{brandSub:'Budget de recherche',navGeneral:'Général',navBudget:"Budget de l'étude",navTools:'Outils',dashboard:'Vue générale',studies:'Études',compare:'Comparer',participants:'Participants',consumables:'Consommables',personnel:'Personnel',equipment:'Matériel',services:'Services & autres',travel:'Déplacements',funding:'Financements',expenses:'Dépenses réelles',orders:'Commandes',scenarios:'Scénarios',reports:'Rapports',data:'Données',settings:'Personnalisation',install:"Installer l'application",windowsDownload:'Télécharger Windows',study:'Étude',dashDesc:'Pilotage consolidé de toutes les études et de leurs budgets.',studyPortfolio:"Portefeuille d'études",costBreakdown:'Répartition des coûts',alerts:'Alertes'},
 en:{brandSub:'Research budgeting',navGeneral:'General',navBudget:'Study budget',navTools:'Tools',dashboard:'Overview',studies:'Studies',compare:'Compare',participants:'Participants',consumables:'Consumables',personnel:'Personnel',equipment:'Equipment',services:'Services & others',travel:'Travel',funding:'Funding',expenses:'Actual expenses',orders:'Orders',scenarios:'Scenarios',reports:'Reports',data:'Data',settings:'Customization',install:'Install app',windowsDownload:'Download Windows',study:'Study',dashDesc:'Consolidated management of all studies and budgets.',studyPortfolio:'Study portfolio',costBreakdown:'Cost breakdown',alerts:'Alerts'}
};

function defaultStudy(name='Étude 1'){
 return {id:uid(),name,code:'',status:'Planifiée',startDate:'',endDate:'',targetN:40,validN:0,exclusionRate:10,dropoutRate:0,techLossRate:0,pilotN:0,sessionsPerParticipant:1,compensation:0,sessionMinutes:60,overheadRate:0,tags:[],description:'',createdAt:new Date().toISOString(),
 consumables:[],personnel:[],equipment:[],services:[],travel:[],funding:[],expenses:[],orders:[],scenarios:[]};
}
function demoState(){
 const a=defaultStudy('Étude 1');a.code='STUDY-01';a.status='En cours';a.targetN=40;a.validN=12;a.exclusionRate=12;a.compensation=20;a.sessionMinutes=120;a.tags=['EEG','Pilote'];
 a.consumables=[{id:uid(),name:'Gel conducteur',mode:'session',packagePrice:42,packageQty:1000,useQty:35,stockQty:620,unit:'mL',supplier:'',reference:'',fundable:true},{id:uid(),name:'Électrodes ECG',mode:'session',packagePrice:35,packageQty:100,useQty:3,stockQty:40,unit:'unités',supplier:'',reference:'',fundable:true}];
 a.personnel=[{id:uid(),role:'Doctorant',hourly:22,fixedHours:8,hoursPerSession:3.5,includeDirect:false,includeFull:true}];
 a.equipment=[{id:uid(),name:'EEG',mode:'amortized',price:45000,years:8,sharePct:3,maintenance:0,includeDirect:false,includeFull:true}];
 a.funding=[{id:uid(),name:'Enveloppe laboratoire',amount:2500,reference:'',notes:''}];
 const b=defaultStudy('Étude 2');b.code='STUDY-02';b.status='Planifiée';b.targetN=60;b.compensation=10;b.sessionMinutes=45;b.tags=['Comportemental'];
 return {settings:{theme:'light',accent:'green',lang:'fr',scale:'1',contrast:false,dyslexia:false,motion:false,currency:'EUR',sidebarCollapsed:false},studies:[a,b],activeStudyId:a.id};
}
let state=(()=>{try{return JSON.parse(localStorage.getItem(APP_KEY))||demoState()}catch{return demoState()}})();
if(!state.settings) state.settings=demoState().settings;
if(!Array.isArray(state.studies)) state.studies=[];
let currentPage='dashboard',editingStudyId=null,itemType=null,editingItemId=null,deferredPrompt=null;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function save(){localStorage.setItem(APP_KEY,JSON.stringify(state));renderAll()}
function activeStudy(){return state.studies.find(s=>s.id===state.activeStudyId)||state.studies[0]||null}
function fmt(v){return new Intl.NumberFormat(state.settings.lang==='en'?'en-GB':'fr-FR',{style:'currency',currency:state.settings.currency||'EUR',maximumFractionDigits:2}).format(n(v))}
function int(v){return new Intl.NumberFormat(state.settings.lang==='en'?'en-GB':'fr-FR',{maximumFractionDigits:0}).format(n(v))}
function requiredParticipants(s,override={}){const target=n(override.targetN??s.targetN), ex=pct(override.exclusionRate??s.exclusionRate), dr=pct(override.dropoutRate??s.dropoutRate), tl=pct(override.techLossRate??s.techLossRate);const validRate=Math.max(.0001,(1-ex)*(1-dr)*(1-tl));return Math.ceil(target/validRate)+n(s.pilotN)}
function remainingParticipants(s){return Math.max(0,requiredParticipants(s)-n(s.validN))}
function sessions(s,override={}){return requiredParticipants(s,override)*Math.max(1,n(s.sessionsPerParticipant))}
function consumableCostItem(x,s,override={}){if(x.mode==='fixed')return n(x.packagePrice)*Math.max(1,n(x.packageQty)||1);const unitCost=n(x.packageQty)>0?n(x.packagePrice)/n(x.packageQty):0;return unitCost*n(x.useQty)*sessions(s,override)}
function personnelCostItem(x,s,override={}){return n(x.hourly)*(n(x.fixedHours)+n(x.hoursPerSession)*sessions(s,override))}
function equipmentCostItem(x){if(x.mode==='purchase'||x.mode==='rental')return n(x.price)+n(x.maintenance);if(x.mode==='amortized'){const annual=n(x.years)>0?n(x.price)/n(x.years):n(x.price);return annual*(n(x.sharePct)/100)+n(x.maintenance)}return n(x.price)+n(x.maintenance)}
function genericCost(arr){return (arr||[]).reduce((a,x)=>a+n(x.amount),0)}
function calcStudy(s,override={}){
 const sess=sessions(s,override), comp=n(override.compensation??s.compensation)*sess;
 const cons=(s.consumables||[]).reduce((a,x)=>a+consumableCostItem(x,s,override),0);
 const pers=(s.personnel||[]).reduce((a,x)=>a+personnelCostItem(x,s,override),0);
 const eq=(s.equipment||[]).reduce((a,x)=>a+equipmentCostItem(x),0);
 const services=genericCost(s.services),travel=genericCost(s.travel);
 const directPersonnel=(s.personnel||[]).reduce((a,x)=>a+(x.includeDirect?personnelCostItem(x,s,override):0),0);
 const directEq=(s.equipment||[]).reduce((a,x)=>a+(x.includeDirect?equipmentCostItem(x):0),0);
 const fullPersonnel=(s.personnel||[]).reduce((a,x)=>a+(x.includeFull!==false?personnelCostItem(x,s,override):0),0);
 const fullEq=(s.equipment||[]).reduce((a,x)=>a+(x.includeFull!==false?equipmentCostItem(x):0),0);
 let direct=comp+cons+directPersonnel+directEq+services+travel;
 direct*=1+n(override.surchargePct||0)/100;
 const overhead=direct*pct(override.overheadRate??s.overheadRate);
 const full=comp+cons+fullPersonnel+fullEq+services+travel+overhead;
 const funded=genericCost(s.funding),spent=genericCost(s.expenses);
 return {required:requiredParticipants(s,override),sessions:sess,participants:comp,consumables:cons,personnel:pers,equipment:eq,services,travel,direct,overhead,full,funded,spent,remainingFunds:funded-spent,costPerValid:n(override.targetN??s.targetN)?full/n(override.targetN??s.targetN):0};
}
function portfolio(){return state.studies.filter(s=>s.status!=='Archivée').reduce((a,s)=>{const c=calcStudy(s);Object.keys(a).forEach(k=>a[k]+=n(c[k]));return a},{direct:0,full:0,funded:0,spent:0,participants:0,consumables:0,personnel:0,equipment:0,services:0,travel:0})}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function applySettings(){const d=document.documentElement;d.dataset.theme=state.settings.theme;d.dataset.accent=state.settings.accent;d.dataset.contrast=state.settings.contrast?'high':'normal';d.dataset.dyslexia=state.settings.dyslexia?'on':'off';d.dataset.motion=state.settings.motion?'reduced':'normal';d.style.setProperty('--font-scale',state.settings.scale||'1');document.documentElement.lang=state.settings.lang||'fr';$('#langBtn').textContent=(state.settings.lang||'fr').toUpperCase();$$('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;el.textContent=translations[state.settings.lang]?.[k]||translations.fr[k]||el.textContent});
 $('#setTheme').value=state.settings.theme;$('#setAccent').value=state.settings.accent;$('#setLang').value=state.settings.lang;$('#setScale').value=state.settings.scale;$('#setContrast').checked=!!state.settings.contrast;$('#setDyslexia').checked=!!state.settings.dyslexia;$('#setMotion').checked=!!state.settings.motion;$('#setCurrency').value=state.settings.currency;document.querySelector('meta[name="theme-color"]').content=getComputedStyle(d).getPropertyValue('--accent').trim()||'#2f6d54';}
function renderSelector(){const sel=$('#studySelector');sel.innerHTML=`<option value="__all__">${state.settings.lang==='en'?'All studies':'Toutes les études'}</option>`+state.studies.filter(s=>s.status!=='Archivée').map(s=>`<option value="${s.id}">${esc(s.code?`${s.code} - ${s.name}`:s.name)}</option>`).join('');sel.value=state.activeStudyId||'__all__'}
function studyBadge(s){return s.status==='En cours'?'<span class="pill">En cours</span>':s.status==='Terminée'?'<span class="pill neutral">Terminée</span>':s.status==='Archivée'?'<span class="pill danger">Archivée</span>':'<span class="pill warn">Planifiée</span>'}
