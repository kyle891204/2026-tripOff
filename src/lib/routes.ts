/** 라우트 경로는 여기서만 정의하고, 다른 곳에서는 상수로 참조한다. */
export const ROUTES = {
  home: '/',
  demo: '/demo',
  /** 앱 화면 단독 보기 (캡처·QA 용) */
  screen: '/screens/:id',
  /** 파트너센터 (여행사 관리자) */
  partner: '/partners',
  partnerProducts: '/partners/products',
  partnerVouchers: '/partners/vouchers',
} as const
