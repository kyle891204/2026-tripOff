/** 라우트 경로는 여기서만 정의하고, 다른 곳에서는 상수로 참조한다. */
export const ROUTES = {
  home: '/',
  demo: '/demo',
  /** 앱 화면 단독 보기 (캡처·QA 용) */
  screen: '/screens/:id',
} as const
