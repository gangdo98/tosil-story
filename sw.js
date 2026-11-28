/* 서비스 워커 — 토실이 준비 노트
   이 워커는 자기 사이트(tosil-story) 안의 같은 출처 GET 요청만 다룹니다.
   네트워크가 되면 최신본을 받아 캐시를 갱신하고(느리면 2.5초 뒤 캐시로 먼저 띄움),
   오프라인이면 캐시로 답합니다. 설치 시점에 화면 자산을 전부 미리 받아 두므로
   첫 방문 한 번이면 비행기 모드에서도 열립니다.
   - 캐시 조회는 ignoreSearch (버전 쿼리 ?v= 가 달라도 같은 파일로 봄)
   - navigate 는 주소 모양(/, /index.html, #hash, ?v=...)과 무관하게 index.html 로 폴백
   - 외부(Firebase·폰트·CDN·지도 타일)는 손대지 않고 그대로 통과 */
'use strict';

const SITE = 'tosil-story';
const VERSION = '2026-11-29e';
const CACHE = 'tosil-pwa-' + SITE + '-' + VERSION;
const LEGACY = ['tosil-pwa-2026-11-29a', 'tosil-pwa-2026-11-29b', 'tosil-pwa-2026-11-29c', 'tosil-pwa-2026-11-29d'];
const SITE_BASE = new URL('./', self.location.href).pathname;   /* 예: '/', '/fukuoka-trip/' */
const NET_TIMEOUT = 2500;

/* 설치할 때 무조건 받아 두는 화면 자산 (없는 파일은 건너뜀) */
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles.css?v=20261128d',
  './friend-list.js?v=20261125d',
  './app.js?v=20261128d',
  './assets/ultra-20260828-07w4d.jpg',
  './assets/ultra-20260929-12w1d-a.jpg',
  './assets/ultra-20260929-12w1d-b.jpg',
  './assets/ultra-20261017-14w5d.jpg',
  './assets/ultra-20261124-20w1d.jpg',
  './assets/luanne-contract.jpg?v=20261125m',
  './assets/luanne-payment.jpg?v=20261125m',
  './assets/medi-spa-free.jpg',
  './assets/medi-spa-price.jpg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

const OFFLINE_HTML = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>토실이 준비 노트 · 오프라인</title><style>
html,body{margin:0;height:100%;background:#FAF7F1;color:#3B342C;
font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}
main{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;
gap:14px;padding:32px;text-align:center}
h1{font-size:17px;margin:0;letter-spacing:-.01em}
p{margin:0;font-size:13px;line-height:1.65;color:#7A6E62;max-width:17em}
button{margin-top:6px;padding:11px 22px;border:0;border-radius:999px;background:#3B342C;color:#FAF7F1;
font-size:13px;font-weight:600;font-family:inherit}
</style></head><body><main>
<h1>토실이 준비 노트</h1>
<p>아직 이 화면을 저장하지 못했어요. 인터넷이 연결된 상태에서 한 번 열어 두면 다음부터는 오프라인에서도 열립니다.</p>
<button onclick="location.reload()">다시 열기</button>
</main></body></html>`;

/* ── 설치: 화면 자산 프리캐시 ───────────────────────────── */
self.addEventListener('install', function (event) {
  event.waitUntil((async function () {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map(async function (url) {
      try {
        const res = await fetch(new Request(url, { cache: 'reload' }));
        if (res && (res.ok || res.type === 'opaque')) await cache.put(url, res);
      } catch (e) { /* 하나 실패해도 설치는 계속 (다음 방문 때 CACHE_URLS 로 보충) */ }
    }));
    await self.skipWaiting();
  })());
});

/* ── 활성화: 이 사이트의 옛 캐시만 정리 ─────────────────── */
self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    const keys = await caches.keys();
    await Promise.all(keys.map(function (key) {
      if (key.indexOf('tosil-pwa-' + SITE + '-') === 0 && key !== CACHE) return caches.delete(key);
      if (LEGACY.indexOf(key) !== -1) return caches.delete(key);
    }));
    await self.clients.claim();
  })());
});

/* ── 캐시 조회 도우미 ──────────────────────────────── */
async function cacheLookup(request) {
  const cache = await caches.open(CACHE);
  let hit = await cache.match(request, { ignoreSearch: true });
  if (hit) return hit;
  /* 내 캐시에 없으면 다른 사이트(포털 ↔ 하위 사이트) 캐시까지 뒤진다 */
  try { hit = await caches.match(request, { ignoreSearch: true }); } catch (e) { hit = null; }
  return hit || null;
}

async function matchUrl(url) {
  const cache = await caches.open(CACHE);
  let hit = await cache.match(url, { ignoreSearch: true });
  if (hit) return hit;
  try { hit = await caches.match(url, { ignoreSearch: true }); } catch (e) { hit = null; }
  return hit || null;
}

/* 이 주소를 요청하면 어떤 index.html 을 돌려줄지 */
function shellFor(pathname) {
  if (pathname === SITE_BASE || pathname === SITE_BASE.replace(/\/$/, '') ||
      pathname === SITE_BASE + 'index.html' || pathname.indexOf(SITE_BASE) === 0) {
    return './index.html';
  }
  return null;
}

/* ── 네트워크 우선 + 캐시 폴백 ─────────────────────────── */
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  let fresh = request;
  try { fresh = new Request(request, { cache: 'no-cache' }); } catch (e) { fresh = request; }

  const netPromise = fetch(fresh).then(function (res) {
    if (res && res.ok && res.type === 'basic') {
      cache.put(request, res.clone()).catch(function () {});
    }
    return res;
  });
  netPromise.catch(function () {});

  let timer = null;
  try {
    const res = await Promise.race([
      netPromise,
      new Promise(function (_, reject) { timer = setTimeout(function () { reject(new Error('slow')); }, NET_TIMEOUT); })
    ]);
    if (timer) clearTimeout(timer);
    return res;
  } catch (err) {
    if (timer) clearTimeout(timer);
    const cached = await cacheLookup(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const shell = shellFor(new URL(request.url).pathname);
      if (shell) {
        const html = await matchUrl(shell);
        if (html) return html;
      }
    }
    return null;
  }
}

/* ── 화면이 넘겨준 자원 보충 캐시 ───────────────────────── */
self.addEventListener('message', function (event) {
  const data = event.data;
  if (!data || data.type !== 'CACHE_URLS' || !Array.isArray(data.urls)) return;
  event.waitUntil((async function () {
    const cache = await caches.open(CACHE);
    const urls = data.urls.slice(0, 80);
    await Promise.all(urls.map(async function (url) {
      try {
        const hit = await cache.match(url, { ignoreSearch: true });
        if (hit) return;
        const res = await fetch(new Request(url, { cache: 'reload' }));
        if (res && (res.ok || res.type === 'opaque')) await cache.put(url, res);
      } catch (e) {}
    }));
  })());
});

/* ── 요청 가로채기 ──────────────────────────────────── */
self.addEventListener('fetch', function (event) {
  const request = event.request;
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;      /* 외부 요청(Firebase·폰트·CDN·타일)은 그대로 */
  if (url.pathname.endsWith('/sw.js')) return;          /* 워커 스크립트 자체는 통과 */
  if (request.headers.get('range')) return;             /* 부분 요청(영상 등)은 통과 */

  event.respondWith((async function () {
    const res = await networkFirst(request);
    if (res) return res;
    if (request.mode === 'navigate') {
      return new Response(OFFLINE_HTML, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    }
    return new Response('', { status: 504, statusText: 'Offline' });
  })());
});
