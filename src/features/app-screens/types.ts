export type ScreenId =
  | 'splash'
  | 'home'
  | 'add-voucher'
  | 'review'
  | 'timeline'
  | 'trip-home'
  | 'ticket'
  | 'companions'
  | 'lock'

export interface ScreenProps {
  /** 다른 화면으로 이동 (시연 플레이어가 주입, 방문 기록에 쌓임) */
  go: (id: ScreenId) => void
  /** 직전 화면으로 (기록이 없으면 홈) */
  back: () => void
  /** 직전 동작에 대한 짧은 안내 (예: 저장 완료 토스트) */
  toast?: string
}
