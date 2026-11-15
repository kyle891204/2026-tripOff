import type { DemoScreen } from '@/types/content'

// 스크린샷은 src/assets/images/ 에 넣고 import 해서 image 에 연결
// import homeShot from '@/assets/images/home.png'

export const DEMO_SCREENS: DemoScreen[] = [
  { id: 'home', title: '홈', caption: '홈 화면 설명' },
  { id: 'search', title: '검색', caption: '검색 화면 설명' },
  { id: 'detail', title: '상세', caption: '상세 화면 설명' },
]
