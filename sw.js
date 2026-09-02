// 안전보건점검 관리시스템 — 서비스 워커
// 설치형(앱처럼 실행) 지원 + 오프라인일 때 마지막으로 열었던 화면 표시.
// 항상 네트워크를 먼저 쓰므로 GitHub 에 새로 올린 내용이 곧바로 반영된다.
const CACHE = "safety-v1";
const ASSETS = ["./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;                       // 저장·전송 요청은 그대로 통과
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // Apps Script·Drive 등 외부 요청은 건드리지 않음

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
  );
});
