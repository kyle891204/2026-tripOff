import { VOUCHER_FILES_DB } from '@/features/app-screens/voucherFiles'
import { ROUTES } from '@/lib/routes'

/**
 * 시연용 「캐시 지우기」: 이 브라우저에 남은 시연 기록을 전부 지우고 처음 화면으로 새로 연다.
 * - localStorage / sessionStorage 의 tripoff 로 시작하는 값 (여행·상품·바우처·알림·보안 설정)
 * - 첨부 파일·상품 사진 IndexedDB
 * - 오프라인 캐시와 서비스 워커 (새로 열면 최신 버전으로 다시 받는다)
 * 각 단계는 실패해도 다음 단계를 계속한다.
 */
export async function clearDemoCache() {
  for (const store of [localStorage, sessionStorage]) {
    try {
      Object.keys(store).filter(key => key.startsWith('tripoff')).forEach(key => store.removeItem(key))
    } catch { /* 저장소를 못 쓰는 환경 */ }
  }
  try {
    await new Promise<void>(resolve => {
      const request = indexedDB.deleteDatabase(VOUCHER_FILES_DB)
      request.onsuccess = request.onerror = request.onblocked = () => resolve()
    })
  } catch { /* IndexedDB 없음 */ }
  try {
    if ('caches' in window) {
      for (const key of await caches.keys()) if (key.startsWith('tripoff-demo')) await caches.delete(key)
    }
  } catch { /* Cache Storage 없음 */ }
  try {
    if ('serviceWorker' in navigator) {
      for (const registration of await navigator.serviceWorker.getRegistrations()) await registration.unregister()
    }
  } catch { /* 서비스 워커 없음 */ }
  // 모듈에 들고 있던 상태까지 비우려면 새로 불러와야 한다
  window.location.assign(ROUTES.demo)
}

export function confirmClearDemoCache() {
  if (!window.confirm('이 브라우저에 저장된 시연 기록(만든 여행, 등록한 상품·사진, 바우처, 알림, 보안 설정)과 오프라인 캐시를 모두 지우고 처음 화면으로 갈까요?')) return
  void clearDemoCache()
}
