import type { ComponentType } from 'react'
import AddVoucherScreen from './screens/AddVoucherScreen'
import CompanionsScreen from './screens/CompanionsScreen'
import HomeScreen from './screens/HomeScreen'
import LockScreen from './screens/LockScreen'
import ReviewScreen from './screens/ReviewScreen'
import SplashScreen from './screens/SplashScreen'
import TicketScreen from './screens/TicketScreen'
import TimelineScreen from './screens/TimelineScreen'
import TripHomeScreen from './screens/TripHomeScreen'
import type { ScreenId, ScreenProps } from './types'

export interface ScreenMeta {
  id: ScreenId
  title: string
  caption: string
  /** hifi: Figma 하이파이 그대로 / temp: 하이파이 없음 → 임시 구성 */
  source: 'hifi' | 'temp'
  /** Figma 노드 (하이파이만) */
  figmaNode?: string
  /**
   * 자체 뒤로/닫기 버튼이 없는 화면에 띄우는 앱 내 플로팅 뒤로가기 위치 (393×852 기준 좌상단 좌표).
   * 디자인 요소를 가리지 않는 빈 자리로 화면마다 지정.
   */
  floatingBack?: { left: number; top: number }
  Component: ComponentType<ScreenProps>
}

/** 시연 순서대로 */
export const SCREENS: ScreenMeta[] = [
  { id: 'splash', title: '스플래시', caption: '예약은 따로, 관리는 한곳에서', source: 'temp', Component: SplashScreen },
  { id: 'home', title: '내 여행', caption: '여행 카드 하나에 모든 예약처의 티켓이 모여요', source: 'hifi', figmaNode: '17:75', Component: HomeScreen },
  { id: 'add-voucher', title: '바우처 추가', caption: 'PDF·메일·캡처 어디서 받은 바우처든 그대로 넣어요', source: 'hifi', figmaNode: '18:74', Component: AddVoucherScreen },
  { id: 'review', title: '추출 결과 확인', caption: '원본과 다른 값은 표시해 주고, 한 번에 고쳐요', source: 'hifi', figmaNode: '18:167', Component: ReviewScreen },
  { id: 'timeline', title: '통합 타임라인', caption: '흩어진 예약이 하루 일정으로, 겹치는 일정은 경고', source: 'hifi', figmaNode: '18:232', floatingBack: { left: 325, top: 762 }, Component: TimelineScreen },
  { id: 'trip-home', title: '여행 중 홈', caption: '오프라인이어도 다음 입장 QR 이 바로 떠요', source: 'hifi', figmaNode: '18:325', floatingBack: { left: 325, top: 762 }, Component: TripHomeScreen },
  { id: 'ticket', title: '티켓', caption: '현장에서 보여줄 QR 을 크게, 밝기 최대로', source: 'hifi', figmaNode: '18:367', Component: TicketScreen },
  { id: 'companions', title: '동행 · 정산', caption: '함께 가는 사람과 티켓을 나누고 1인당 비용까지', source: 'hifi', figmaNode: '18:410', Component: CompanionsScreen },
  { id: 'lock', title: '잠금 화면 위젯', caption: '폰을 열지 않아도 입장 QR 을 꺼내요 (프리미엄)', source: 'hifi', figmaNode: '18:458', floatingBack: { left: 325, top: 532 }, Component: LockScreen },
]

export const SCREEN_BY_ID = Object.fromEntries(SCREENS.map((s) => [s.id, s])) as Record<ScreenId, ScreenMeta>
