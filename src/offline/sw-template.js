/* 빌드에서 버전과 파일 목록을 실제 배포 파일로 교체합니다. */
const version = '__TRIPOFF_CACHE_VERSION__'
const assets = /*__TRIPOFF_PRECACHE__*/ []
const cacheName = 'tripoff-demo-' + version
const root = new URL(self.registration.scope)
const shell = new URL('index.html', root)

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName)
    await cache.addAll(assets.map(asset => new URL(asset, root).href))
    await self.skipWaiting()
  })())
})
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('tripoff-demo-') && key !== cacheName) await caches.delete(key)
    }
    await self.clients.claim()
  })())
})
self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(root.href)) return
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request)
        if (response.ok) return response
      } catch { /* 연결이 없으면 저장 화면을 사용합니다. */ }
      return (await (await caches.open(cacheName)).match(shell)) ?? Response.error()
    })())
  } else {
    event.respondWith((async () => (await (await caches.open(cacheName)).match(request)) ?? fetch(request))())
  }
})
