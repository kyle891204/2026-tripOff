import type { ReactNode } from 'react'
import styles from './PhoneFrame.module.css'

/** 스마트폰 모양 프레임. 안에 스크린샷/영상/iframe 아무거나 넣을 수 있음 */
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.frame}>
      <div className={styles.notch} />
      <div className={styles.screen}>{children}</div>
    </div>
  )
}
