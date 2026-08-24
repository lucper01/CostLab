function openStudyDialog(id=null){editingStudyId=id;const s=id?state.studies.find(x=>x.id===id):defaultStudy(''),f=$('#studyForm');$('#studyDialogTitle').textContent=id?'Modifier l’étude':'Nouvelle étude';['name','code','status','startDate','endDate','targetN','validN','exclusionRate','dropoutRate','techLossRate','pilotN','sessionsPerParticipant','compensation','sessionMinutes','overheadRate','description'].forEach(k=>f.elements[k].value=s[k]??'');f.elements.tags.value=(s.tags||[]).join(', ');$('#studyDialog').showModal()}
function editStudy(id){openStudyDialog(id)}
function duplicateStudy(id){const s=state.studies.find(x=>x.id===id);if(!s)return;const c=JSON.parse(JSON.stringify(s));c.id=uid();c.name=s.name+' - copie';c.code='';c.status='Planifiée';c.validN=0;c.expenses=[];c.orders=[];c.scenarios=[];c.createdAt=new Date().toISOString();state.studies.push(c);state.activeStudyId=c.id;save();toast('Étude dupliquée')}
function archiveStudy(id){const s=state.studies.find(x=>x.id===id);if(!s)return;s.status=s.status==='Archivée'?'Planifiée':'Archivée';if(s.id===state.activeStudyId&&s.status==='Archivée')state.activeStudyId=state.studies.find(x=>x.status!=='Archivée'&&x.id!==s.id)?.id||null;save()}
function deleteScenario(id){const s=activeStudy();s.scenarios=s.scenarios.filter(x=>x.id!==id);save()}

const schemas={
 consumables:{title:'Consommable',fields:[['name','Nom','text'],['mode','Mode','select',['session','fixed']],['packagePrice','Prix du conditionnement','number'],['packageQty','Quantité par conditionnement','number'],['useQty','Quantité utilisée / session','number'],['stockQty','Stock disponible','number'],['unit','Unité','text'],['supplier','Fournisseur','text'],['reference','Référence','text'],['fundable','Éligible financement','checkbox']]},
 personnel:{title:'Personnel',fields:[['role','Rôle','text'],['hourly','Coût horaire','number'],['fixedHours','Heures fixes','number'],['hoursPerSession','Heures / session','number'],['includeDirect','Inclure au budget direct','checkbox'],['includeFull','Inclure au coût complet','checkbox']]},
 equipment:{title:'Matériel',fields:[['name','Équipement','text'],['mode','Mode','select',['purchase','rental','amortized']],['price','Prix / valeur','number'],['years','Durée amortissement (ans)','number'],['sharePct','Part imputée à l’étude (%)','number'],['maintenance','Maintenance / consommables fixes','number'],['includeDirect','Inclure au budget direct','checkbox'],['includeFull','Inclure au coût complet','checkbox']]},
 services:{title:'Service / autre coût',fields:[['name','Poste','text'],['category','Catégorie','text'],['amount','Montant','number'],['fundable','Éligible financement','checkbox'],['notes','Notes','textarea']]},
 travel:{title:'Déplacement',fields:[['name','Poste','text'],['category','Catégorie','select',['Transport','Hébergement','Repas','Mission','Autre']],['amount','Montant','number'],['fundable','Éligible financement','checkbox'],['notes','Notes','textarea']]},
 funding:{title:'Financement',fields:[['name','Source','text'],['amount','Montant','number'],['reference','Référence / centre de coût','text'],['notes','Notes','textarea']]},
 expenses:{title:'Dépense',fields:[['date','Date','date'],['name','Poste','text'],['category','Catégorie','text'],['amount','Montant','number'],['status','Statut','select',['Prévu','Engagé','Payé']],['reference','Référence','text']]},
 orders:{title:'Commande',fields:[['name','Article','text'],['qty','Quantité','number'],['amount','Prix estimé','number'],['supplier','Fournisseur','text'],['reference','Référence','text'],['status','Statut','select',['À commander','Demandé','Commandé','Reçu','Annulé']]]}
};
function openItem(type,id=null){const s=activeStudy();if(!s){toast('Sélectionnez une étude');return}itemType=type;editingItemId=id;const schema=schemas[type],x=id?(s[type]||[]).find(v=>v.id===id):{};$('#itemDialogTitle').textContent=(id?'Modifier - ':'Ajouter - ')+schema.title;$('#itemDialogBody').innerHTML=`<div class="form-grid">${schema.fields.map(([key,label,t,opts])=>{if(t==='select')return `<label>${label}<select name="${key}">${opts.map(o=>`<option ${x[key]===o?'selected':''}>${o}</option>`).join('')}</select></label>`;if(t==='checkbox')return `<label><span>${label}</span><input style="width:auto" type="checkbox" name="${key}" ${x[key]!==false&&(x[key]===true||key==='fundable'||key==='includeFull')?'checked':''}></label>`;if(t==='textarea')return `<label class="span4">${label}<textarea name="${key}" rows="3">${esc(x[key]||'')}</textarea></label>`;return `<label>${label}<input name="${key}" type="${t}" ${t==='number'?'step="0.01"':''} value="${esc(x[key]??'')}"></label>`}).join('')}</div>`;$('#itemDialog').showModal()}
function editItem(type,id){openItem(type,id)}
function deleteItem(type,id){const s=activeStudy();s[type]=s[type].filter(x=>x.id!==id);save();toast('Ligne supprimée')}

$('#studyForm').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,fd=new FormData(f),obj=editingStudyId?state.studies.find(s=>s.id===editingStudyId):defaultStudy();['name','code','status','startDate','endDate','description'].forEach(k=>obj[k]=fd.get(k)||'');['targetN','validN','exclusionRate','dropoutRate','techLossRate','pilotN','sessionsPerParticipant','compensation','sessionMinutes','overheadRate'].forEach(k=>obj[k]=n(fd.get(k)));obj.tags=String(fd.get('tags')||'').split(',').map(x=>x.trim()).filter(Boolean);if(!editingStudyId)state.studies.push(obj);state.activeStudyId=obj.id;$('#studyDialog').close();save();toast('Étude enregistrée')});
$('#itemForm').addEventListener('submit',e=>{e.preventDefault();const s=activeStudy(),schema=schemas[itemType],fd=new FormData(e.currentTarget),obj=editingItemId?s[itemType].find(x=>x.id===editingItemId):{id:uid()};schema.fields.forEach(([k,l,t])=>{obj[k]=t==='checkbox'?e.currentTarget.elements[k].checked:t==='number'?n(fd.get(k)):fd.get(k)||''});if(!editingItemId)s[itemType].push(obj);$('#itemDialog').close();save();toast('Ligne enregistrée')});

$$('[data-open-study]').forEach(b=>b.onclick=()=>openStudyDialog());$('#quickAddStudy').onclick=()=>openStudyDialog();$$('[data-add-item]').forEach(b=>b.onclick=()=>openItem(b.dataset.addItem));
$('#nav').addEventListener('click',e=>{const b=e.target.closest('button[data-page]');if(b)goPage(b.dataset.page)});$('#mobileMenu').onclick=()=>$('#sidebar').classList.toggle('open');$('#studySelector').onchange=e=>selectStudy(e.target.value);$('#studySearch').oninput=renderStudies;$('#studyStatusFilter').onchange=renderStudies;
$('#langBtn').onclick=()=>{state.settings.lang=state.settings.lang==='fr'?'en':'fr';save()};$('#themeBtn').onclick=()=>{state.settings.theme=state.settings.theme==='light'?'dark':'light';save()};
[['setTheme','theme'],['setAccent','accent'],['setLang','lang'],['setScale','scale'],['setCurrency','currency']].forEach(([id,k])=>$('#'+id).onchange=e=>{state.settings[k]=e.target.value;save()});[['setContrast','contrast'],['setDyslexia','dyslexia'],['setMotion','motion']].forEach(([id,k])=>$('#'+id).onchange=e=>{state.settings[k]=e.target.checked;save()});
$('#collapseSidebar').onclick=()=>{const collapsed=getComputedStyle(document.documentElement).getPropertyValue('--sidebar').trim()==='78px';document.documentElement.style.setProperty('--sidebar',collapsed?'268px':'78px');$('#sidebar .brand div:nth-child(2)').classList.toggle('hidden',!collapsed);$$('#nav span,#nav .group,.side-footer small,.side-footer button').forEach(x=>x.classList.toggle('hidden',!collapsed))};
$('#generateOrders').onclick=()=>{const s=activeStudy();if(!s)return;const generated=[];(s.consumables||[]).forEach(x=>{if(x.mode==='fixed')return;const need=n(x.useQty)*sessions(s),missing=Math.max(0,need-n(x.stockQty));if(missing>0){const packs=Math.ceil(missing/Math.max(1,n(x.packageQty)));generated.push({id:uid(),name:x.name,qty:packs,amount:packs*n(x.packagePrice),supplier:x.supplier||'',reference:x.reference||'',status:'À commander'})}});s.orders=[...(s.orders||[]),...generated];save();toast(`${generated.length} ligne(s) ajoutée(s)`) };
$('#saveScenario').onclick=()=>{const s=activeStudy();if(!s)return;const name=prompt('Nom du scénario',`Scénario ${(s.scenarios||[]).length+1}`);if(!name)return;const override=scenarioOverride(),result=calcStudy(s,override);s.scenarios.push({id:uid(),name,override,result,createdAt:new Date().toISOString()});save();toast('Scénario enregistré')};
$('#copyReport').onclick=async()=>{const txt=$('#reportText')?.innerText||$('#reportsContent').innerText;await navigator.clipboard.writeText(txt);toast('Rapport copié')};
function download(name,content,type='text/plain'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function csv(rows){const q=v=>'"'+String(v??'').replaceAll('"','""')+'"';return rows.map(r=>r.map(q).join(';')).join('\n')}
$('#exportJson').onclick=()=>download(`costlab-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(state,null,2),'application/json');$('#dashExport').onclick=$('#exportJson').onclick;
$('#importJson').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(!Array.isArray(data.studies))throw Error();state=data;save();toast('Sauvegarde importée')}catch{alert('Fichier JSON invalide')}};
$('#exportSummaryCsv').onclick=()=>download('costlab-studies.csv',csv([['Study','Code','Status','Target N','Required N','Direct budget','Full cost','Funding','Spent'],...state.studies.map(s=>{const c=calcStudy(s);return[s.name,s.code,s.status,s.targetN,c.required,c.direct,c.full,c.funded,c.spent]})]),'text/csv');
$('#exportBudgetCsv').onclick=()=>{const s=activeStudy();if(!s)return;const c=calcStudy(s);download(`${s.code||s.name}-budget.csv`,csv([['Category','Amount'],['Participants',c.participants],['Consumables',c.consumables],['Personnel',c.personnel],['Equipment',c.equipment],['Services',c.services],['Travel',c.travel],['Overhead',c.overhead],['Direct budget',c.direct],['Full cost',c.full]]),'text/csv')};
$('#exportExpensesCsv').onclick=()=>{const s=activeStudy();if(!s)return;download(`${s.code||s.name}-expenses.csv`,csv([['Date','Name','Category','Amount','Status','Reference'],...(s.expenses||[]).map(x=>[x.date,x.name,x.category,x.amount,x.status,x.reference])]),'text/csv')};
$('#makeSnapshot').onclick=()=>{localStorage.setItem(SNAP_KEY,JSON.stringify(state));toast('Instantané créé')};$('#restoreSnapshot').onclick=()=>{const x=localStorage.getItem(SNAP_KEY);if(x){state=JSON.parse(x);save();toast('Instantané restauré')}};$('#resetAll').onclick=()=>{if(confirm('Réinitialiser toutes les données ?')){state=emptyState();save();toast('Données réinitialisées')}};

const WINDOWS_ASSET='CostLab-Calculator-Setup.exe';
const GITHUB_REPO_FALLBACK='lucper01/CostLab';
function githubRepoSlug(){
  if(location.hostname.endsWith('.github.io')){
    const owner=location.hostname.split('.')[0];
    const repo=location.pathname.split('/').filter(Boolean)[0];
    if(owner&&repo)return `${owner}/${repo}`;
  }
  return GITHUB_REPO_FALLBACK;
}
function setupDesktopDownload(){
  const isElectron=/Electron/i.test(navigator.userAgent);
  const slug=githubRepoSlug();
  const url=`https://github.com/${slug}/releases/latest/download/${WINDOWS_ASSET}`;
  const top=$('#windowsDownloadBtn'),data=$('#windowsDownloadBtnData'),card=$('#desktopDownloadCard');
  if(isElectron){
    if(top)top.hidden=true;
    if(card)card.classList.add('hidden');
    if($('#installBtn'))$('#installBtn').hidden=true;
    return;
  }
  [top,data].forEach(a=>{if(a){a.href=url;a.hidden=false}});
}
setupDesktopDownload();

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').hidden=false});$('#installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').hidden=true}};
if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
renderAll();
