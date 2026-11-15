import { ShopScreen, ShopProductScreen, ShopCheckoutScreen } from './screens/ShopScreens'
import type { ComponentType } from 'react'
import { InviteScreen, ProfileScreen, VoucherImportScreen, VoucherOriginalScreen } from './screens/ExtraDemoScreens'
import AddTripScreen from './screens/AddTripScreen'
import AddVoucherScreen from './screens/AddVoucherScreen'
import CompanionsScreen from './screens/CompanionsScreen'
import HomeScreen from './screens/HomeScreen'
import LockScreen from './screens/LockScreen'
import NotificationsScreen from './screens/NotificationsScreen'
import PlanDetailScreen from './screens/PlanDetailScreen'
import ReviewScreen from './screens/ReviewScreen'
import SplashScreen from './screens/SplashScreen'
import TicketScreen from './screens/TicketScreen'
import TimelineScreen from './screens/TimelineScreen'
import TripHomeScreen from './screens/TripHomeScreen'
import VouchersScreen from './screens/VouchersScreen'
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
  { id: 'splash', title: '스플래시', caption: '티켓이 지갑에 쏙 — 예약은 따로, 관리는 한곳에서', source: 'temp', Component: SplashScreen },
  { id: 'home', title: '내 여행', caption: '예정된 여행을 좌우로 넘기고, 카드 위에서 스크롤하면 티켓이 넘어가며 일정을 훑어봐요', source: 'hifi', figmaNode: '17:75', Component: HomeScreen },
  { id: 'add-trip', title: '여행 추가', caption: '어디로·언제만 정하면 빈 여행이 생기고, 바로 바우처를 모을 수 있어요', source: 'temp', Component: AddTripScreen },
  { id: 'timeline', title: '여행 타임라인', caption: '여행사에서 상품을 사면 일정(바우처 포함)이 자동으로 들어와요. 여행사 일정은 작은 체크로 구분', source: 'hifi', figmaNode: '18:232', floatingBack: { left: 325, top: 762 }, Component: TimelineScreen },
  { id: 'plan', title: '일정 상세 · 바우처', caption: '모든 일정의 바우처를 보고 고칠 수 있어요. 여행사가 바우처 없이 보낸 일정은 직접 등록, 문제가 있으면 문의', source: 'temp', Component: PlanDetailScreen },
  { id: 'vouchers', title: '바우처', caption: '모든 여행의 바우처를 한곳에서. 내 바우처도, 대신 받은 일행 바우처도 여기서 추가해요', source: 'temp', Component: VouchersScreen },
  { id: 'add-voucher', title: '바우처 추가', caption: '여행 안에서 추가 — PDF·메일·캡처 어디서 받은 바우처든 이 여행에 들어가요', source: 'hifi', figmaNode: '18:74', Component: AddVoucherScreen },
  { id: 'review', title: '추출 결과 확인', caption: '예약 정보를 확인하고 바로 여행에 저장해요. 필요한 값만 선택해서 수정할 수 있어요', source: 'hifi', figmaNode: '18:167', Component: ReviewScreen },
  { id: 'trip-home', title: '여행 중 홈', caption: '오프라인이어도 다음 입장 QR 이 바로 떠요 (내 티켓만)', source: 'hifi', figmaNode: '18:325', floatingBack: { left: 325, top: 762 }, Component: TripHomeScreen },
  { id: 'ticket', title: '티켓', caption: '현장에서 보여줄 내 QR 을 크게, 밝기 최대로', source: 'hifi', figmaNode: '18:367', Component: TicketScreen },
  { id: 'companions', title: '동행 · 정산', caption: '여행 단위로 동행을 초대하고 1인당 비용까지. 티켓은 각자 자기 것만', source: 'hifi', figmaNode: '18:410', Component: CompanionsScreen },
  { id: 'voucher-import', title: '원본 파일 선택', caption: '파일을 첨부하거나 준비된 샘플을 골라요', source: 'temp', Component: VoucherImportScreen },
  { id: 'voucher-original', title: '원본 바우처', caption: '첨부한 파일이나 시연용 원본을 확인해요', source: 'temp', Component: VoucherOriginalScreen },
  { id: 'profile', title: '마이페이지', caption: '시연 계정과 내 여행·바우처 메뉴를 확인해요', source: 'temp', Component: ProfileScreen },
  { id: 'invite', title: '동행 초대', caption: '같은 브라우저에서 열 수 있는 초대 링크', source: 'temp', Component: InviteScreen },
  { id: 'shop', title: '여행 상점', caption: '여행사가 등록한 상품을 둘러봐요', source: 'temp', Component: ShopScreen },
  { id: 'shop-product', title: '상품 상세', caption: '이용일과 옵션을 선택해요', source: 'temp', Component: ShopProductScreen },
  { id: 'shop-checkout', title: '상품 결제', caption: '시연 결제 후 바우처가 여행 일정에 저장돼요', source: 'temp', Component: ShopCheckoutScreen },
  { id: 'notifications', title: '알림함', caption: '바우처 변경 알림과 입장 알림을 열어 일정을 확인해요', source: 'temp', Component: NotificationsScreen },
  { id: 'lock', title: '잠금 화면 위젯', caption: '폰을 열지 않아도 입장 QR 을 꺼내요 (프리미엄)', source: 'hifi', figmaNode: '18:458', floatingBack: { left: 325, top: 532 }, Component: LockScreen },
]

export const SCREEN_BY_ID = Object.fromEntries(SCREENS.map((s) => [s.id, s])) as Record<ScreenId, ScreenMeta>

