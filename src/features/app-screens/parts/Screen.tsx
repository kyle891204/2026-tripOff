import type { ReactNode } from 'react'
import StatusBar from './StatusBar'
import HomeIndicator from './HomeIndicator'
import styles from './Screen.module.css'

interface Props {
  bg: string
  children: ReactNode
  offline?: boolean
  dark?: boolean
  label: string
}

/** 393×852 앱 화면 캔버스 (iPhone 15 기준, Figma 프레임 크기) */
export default function Screen({ bg, children, offline, dark, label }: Props) {
  return (
    <div className={styles.screen} style={{ background: bg }} aria-label={label} data-app-screen>
      <StatusBar offline={offline} light={dark} />
      {children}
      <HomeIndicator light={dark} />
    </div>
  )
}
