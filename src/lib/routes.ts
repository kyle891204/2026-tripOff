/** 라우트 경로는 여기서만 정의하고, 다른 곳에서는 상수로 참조한다. */
export const ROUTES = {
  home: '/',
  demo: '/demo',
  /** 파트너센터 (여행사 관리자) */
  partner: '/partners',
  partnerProducts: '/partners/products',
  partnerProductNew: '/partners/products/new',
  partnerVouchers: '/partners/vouchers',
} as const
