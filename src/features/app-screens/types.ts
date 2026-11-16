export type ScreenId =
  | 'splash'
  | 'home'
  | 'add-trip'
  | 'timeline'
  | 'plan'
  | 'add-voucher'
  | 'review'
  | 'trip-home'
  | 'ticket'
  | 'companions'
  | 'lock'
  | 'voucher-import'
  | 'voucher-original'
  | 'profile'
  | 'invite'
  | 'notifications'
  | 'shop'
  | 'shop-product'
  | 'shop-checkout'
  | 'vouchers'
  | 'settings'
  | 'app-lock'
  | 'orders'
  | 'order-detail'
  | 'past-trips'
  | 'favorites'
  | 'push-settings'

export interface GoOptions {
  /** 도착한 화면에 띄울 짧은 안내 (예: 저장 완료) */
  toast?: string
  /** 지금 화면을 방문 기록에 남기지 않음 (뒤로가기로 다시 오지 않게. 예: 작성 폼) */
  replace?: boolean
}

export interface ScreenProps {
  /** 다른 화면으로 이동 (시연 플레이어가 주입, 방문 기록에 쌓임) */
  go: (id: ScreenId, options?: GoOptions) => void
  /** 직전 화면으로 (기록이 없으면 홈) */
  back: () => void
  /** 이전 화면에서 넘겨준 안내 */
  toast?: string
}
