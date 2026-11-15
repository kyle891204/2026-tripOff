import type { ReactNode } from 'react'
import styles from './PhoneFrame.module.css'

/**
 * 393×852 앱 화면을 축소해서 보여주는 틀 (베젤 없이 둥근 화면 + 그림자만).
 * 크기는 PhoneFrame.module.css 의 --w / --h / --scale 로 조절.
 */
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.frame}>
      <div className={styles.canvas}>{children}</div>
    </div>
  )
}
