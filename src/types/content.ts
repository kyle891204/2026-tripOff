export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

export interface DemoScreen {
  id: string
  title: string
  caption: string
  /** src/assets/images 아래 스크린샷 import 결과. 없으면 placeholder 표시 */
  image?: string
}
