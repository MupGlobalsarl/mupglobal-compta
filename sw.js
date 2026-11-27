const C='mgcompta-v4-18';
const F=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
// Installation : copie fraîche (sans le cache HTTP) de l'application
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
// Démarrage immédiat depuis la copie du téléphone ; internet est consulté en arrière-plan.
// Seuls version.json et le rechargement « Mettre à jour maintenant » (?u=) passent d'abord par internet.
self.addEventListener('fetch',e=>{
  const q=e.request;if(q.method!=='GET')return;
  const u=new URL(q.url);if(u.origin!==location.origin)return;
  const doc=q.mode==='navigate'||/\/(index\.html)?$/.test(u.pathname);
  const key=doc?'./index.html':q;
  const net=()=>fetch(q,{cache:'no-cache'}).then(r=>{if(r&&r.ok&&r.type==='basic'){const cp=r.clone();caches.open(C).then(c=>c.put(key,cp))}return r});
  if(u.pathname.endsWith('version.json')||u.searchParams.has('u')){
    e.respondWith(net().catch(()=>caches.match(key,{ignoreSearch:true})));return}
  e.respondWith(caches.match(key,{ignoreSearch:doc}).then(c=>{
    if(c){e.waitUntil(net().catch(()=>{}));return c}
    return net().catch(()=>caches.match('./index.html'))}));
});
