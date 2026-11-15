import { ROUTES } from '@/lib/routes'

/** 사이트 공통 문구/링크. 텍스트 수정은 이 파일에서. */
export const SITE = {
  name: 'TripOff',
  tagline: '여행을 더 가볍게',
  description: '앱 소개 문구를 여기에 작성하세요.',
  nav: [
    { label: '소개', to: ROUTES.home },
    { label: '시연', to: ROUTES.demo },
  ],
  team: 'TripOff 팀',
  year: 2026,
} as const
