import { ROUTES } from '@/lib/routes'

/** 사이트 공통 문구/링크. 텍스트 수정은 이 파일에서. */
export const SITE = {
  name: 'TripOff',
  tagline: '예약은 따로,\n관리는 한곳에서',
  description: '항공·숙소·입장권, 여러 예약처에서 받은 바우처를 한 앱에 모으고 현장에서는 인터넷 없이 바로 꺼내 보세요.',
  nav: [
    { label: '소개', to: ROUTES.home },
    { label: '시연', to: ROUTES.demo },
  ],
  team: 'TripOff 팀',
  year: 2026,
} as const
