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