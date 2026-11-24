import type { ScreenId } from '@/features/app-screens'
import { ROUTES } from '@/lib/routes'

/**
 * 시연 전체 흐름. 고객 앱 → 파트너센터 → 다시 고객 앱에서 보안·현장 사용·마무리.
 * /demo 와 파트너센터가 같은 목록과 같은 컨트롤러(FlowPanel)를 쓰고, 「다음」 하나로 이어서 넘긴다.
 *
 * act: 이 단계에서 「다음」이 대신 눌러 줄 화면 동작(stepAction scope).
 *      동작이 남아 있으면 다음 단계로 안 넘어가고 그 기능을 실행해서 보여 준다.
 */
export interface AppStep {
  part: 'app' | 'outro'
  title: string
  desc: string
  entry: ScreenId
  screens: ScreenId[]
  act?: string[]
  /** 이 단계에 들어갈 때 맞출 시연 시각 (''이면 여행 전으로 되돌림) */
  demoNow?: string
  /** demoNow 와 함께 보여 줄 오사카 여행 날짜 (0부터) */
  day?: number
  /** 상점을 이 나라·도시 상품 목록으로 열기 */
  shop?: { country: string; destination: string }
}
export type PartnerStep = { part: 'partner'; title: string; desc: string; act?: string[] } & ({ route: string; also?: string } | { phone: ScreenId })
export type FlowStep = AppStep | PartnerStep

export const APP_STEPS: AppStep[] = [
  { part: 'app', title: '여행 만들기', desc: '어디로, 언제만 정하면 빈 여행이 생겨요.', entry: 'add-trip', screens: ['splash', 'app-lock', 'home', 'add-trip'] },
  { part: 'app', title: '동행 추가 · 정산', desc: '여행에 동행을 초대하고 1인당 비용을 나눠요.', entry: 'companions', screens: ['companions', 'invite'] },
  // 바우처를 저장하면 타임라인으로 가므로, 일정 정리는 같은 단계에서 이어서 보여 준다 (같은 화면이 두 번 나오지 않게)
  { part: 'app', title: '바우처 등록 · 일정 정리', desc: '샘플 바우처를 골라 확인하고 저장하면, 흩어진 예약과 함께 여행 타임라인에 날짜별로 정리돼요.', entry: 'voucher-import', screens: ['vouchers', 'add-voucher', 'voucher-import', 'review', 'voucher-original', 'timeline', 'plan'], act: ['voucher-import', 'review'] },
  { part: 'app', title: '여행 상점', desc: '파트너 여행사의 특가 상품을 둘러봐요. 결제하면 바우처가 내 여행 일정에 바로 들어와요. 이 상품은 누가, 어떻게 관리할까요?', entry: 'shop', screens: ['shop', 'shop-product', 'shop-checkout', 'favorites', 'orders', 'order-detail'], shop: { country: '일본', destination: '오사카' } },
]

export const PARTNER_STEPS: PartnerStep[] = [
  { part: 'partner', title: '파트너센터 대시보드', desc: '상점 상품은 여행사가 직접 관리해요. 오늘 이용, 발송 대기, 매출을 한눈에 봐요.', route: ROUTES.partnerDashboard },
  { part: 'partner', title: '특가 상품 등록', desc: '「다음」을 누를 때마다 한 섹션씩 예시가 채워지고, 다 채우면 등록돼요.', route: ROUTES.partnerProductNew, also: ROUTES.partnerProducts, act: ['product-new'] },
  { part: 'partner', title: '고객 상점에 바로 노출', desc: '방금 등록한 상품이 고객 앱 상점에 새 사진으로 올라와요.', phone: 'shop' },
  { part: 'partner', title: '고객이 구매', desc: '상품을 골라 시연 결제하면 여행사에 예약이 들어가요.', phone: 'shop-product', act: ['shop-product', 'shop-checkout'] },
  { part: 'partner', title: '바우처 발송', desc: '「발송 대기」로 들어온 바우처를 골라 지금 발송을 눌러요.', route: ROUTES.partnerVouchers, act: ['vouchers'] },
  { part: 'partner', title: '고객 앱에 도착', desc: '고객 알림함에 바우처 도착 알림이 오고, 누르면 QR이 열려요.', phone: 'notifications', act: ['notifications'] },
]

/** 다시 고객 앱으로 돌아와 보안·현장 사용을 보여 주고 마무리 */
export const OUTRO_STEPS: AppStep[] = [
  { part: 'outro', title: '보안 잠금', desc: '티켓 QR과 앱을 생체 인식 · 패턴 · PIN으로 잠가요. 앱을 열 때, QR을 열 때 따로 잠글 수 있어요.', entry: 'settings', screens: ['settings', 'app-lock'] },
  { part: 'outro', title: '현장에서 바로 입장', desc: '여행 중엔 홈에 다음 입장 QR이 바로 떠요. 오프라인에서도 열리고, 잠금 화면 위젯으로도 꺼내요.', entry: 'trip-home', screens: ['trip-home', 'ticket', 'lock'], demoNow: '2026-06-13T13:30', day: 1 },
  { part: 'outro', title: '예약은 따로, 관리는 한곳에서', desc: '고객은 흩어진 예약을 하나의 여행 지갑으로, 여행사는 파트너센터에서 상품 등록부터 바우처 발송까지. 트립오프였습니다.', entry: 'home', screens: ['home'], demoNow: '' },
]

export const FLOW: FlowStep[] = [...APP_STEPS, ...PARTNER_STEPS, ...OUTRO_STEPS]

/** 파트너센터 단계의 전체 흐름 번호 */
export const PARTNER_OFFSET = APP_STEPS.length
/** 마무리 단계의 전체 흐름 번호 */
export const OUTRO_OFFSET = PARTNER_OFFSET + PARTNER_STEPS.length

/** 앱(/demo)에서 진행하는 단계인지 */
export const isAppStep = (step: FlowStep | undefined): step is AppStep => !!step && 'entry' in step

export const PART_LABEL: Record<FlowStep['part'], string> = { app: '고객 앱', partner: '파트너센터', outro: '마무리 · 고객 앱' }

/** /demo?step=3 처럼 고객 앱 단계로 돌아갈 때 쓰는 주소 (1부터) */
export const demoStepUrl = (index: number) => `${ROUTES.demo}?step=${index + 1}`
