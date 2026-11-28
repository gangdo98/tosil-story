/* 서비스 워커 — 토실이 준비 노트
   같은 출처(same-origin)만 다룹니다. HTML/CSS/JS/JSON 은 Network-first:
   네트워크가 되면 항상 최신본을 받아 캐시를 갱신하고, 오프라인일 때만 캐시를 씁니다.
   Firebase·Google Fonts·CDN·지도 타일 같은 외부 요청은 그대로 통과시킵니다. */
'use strict';

const VERSION = '2026-11-29a';
const CACHE = 'tosil-pwa-' + VERSION;
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

/* 이 워커가 맡는 사이트의 루트 경로 (예: '/', '/tosil-home/') */
const SITE_BASE = new URL('./', self.location.href).pathname;

self.addEventListener('install', function (event) {
  event.waitUntil((async function () {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map(async function (url) {
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (res && res.ok) await cache.put(url, res);
      } catch (e) { /* 하나 실패해도 설치는 계속 */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    const keys = await caches.keys();
    await Promise.all(keys.map(function (key) {
      if (key.indexOf('tosil-pwa-') === 0 && key !== CACHE) return caches.delete(key);
    }));
    await self.clients.claim();
  })());
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === 'basic') {
      cache.put(request, response.clone()).catch(function () {});
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const relaxed = await cache.match(request, { ignoreSearch: true });
    if (relaxed) return relaxed;
    if (request.mode === 'navigate') {
      const path = new URL(request.url).pathname;
      if (path === SITE_BASE || path === SITE_BASE + 'index.html') {
        const shell = await cache.match('./index.html') || await cache.match('./');
        if (shell) return shell;
      }
    }
    return new Response('오프라인이에요. 연결되면 다시 열어 주세요.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

self.addEventListener('fetch', function (event) {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;   /* 외부 요청은 손대지 않음 */
  if (url.pathname.endsWith('/sw.js')) return;       /* 워커 스크립트 자체는 통과 */

  event.respondWith(networkFirst(request));
});
