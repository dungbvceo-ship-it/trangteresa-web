/* ETM Reader – service worker: chỉ lưu khung giao diện để mở nhanh và dùng Checklist khi mất mạng.
   KHÔNG lưu dữ liệu từ máy chủ (trang sách, thông tin tài khoản). */
const V = 'etm-shell-v1';
const SHELL = ['thu-vien.html', 'checklist.html', 'style.css', 'config.js', 'images/logo.png', 'icons/icon-192.png', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;     // API, font, QR: không can thiệp
  e.respondWith(fetch(e.request).then(r => {                                   // mạng trước, lỗi mạng mới dùng bản lưu
    if (r.ok && SHELL.some(p => u.pathname.endsWith('/' + p.split('?')[0]))) { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
