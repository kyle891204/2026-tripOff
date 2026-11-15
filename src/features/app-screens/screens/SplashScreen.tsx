import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import Screen from '../parts/Screen'
import type { ScreenProps } from '../types'
import styles from './SplashScreen.module.css'

/** 지갑으로 떨어지는 티켓 (뒤 → 앞 순서로 들어감) */
const TICKETS = ['coral', 'sand', 'mint', 'paper'] as const

/** 애니메이션 끝나고 홈으로 넘어가는 시점 (ms) */
const AUTO_NEXT_MS = 3400
const AUTO_NEXT_REDUCED_MS = 1200

/**
 * ⚠ 임시 화면 — Figma 하이파이에 스플래시가 없음.
 * 티켓 4장이 지갑에 차례로 들어가고 → 로고·문구가 뜬 뒤 → 홈으로 자동 이동.
 * 화면을 누르면 바로 넘어감.
 */
export default function SplashScreen({ go }: ScreenProps) {
  // 부모가 다시 렌더돼도 타이머가 리셋되지 않도록 최신 go 만 ref 로 참조
  const goRef = useRef(go)
  useEffect(() => {
    goRef.current = go
  })

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(() => goRef.current('home'), reduced ? AUTO_NEXT_REDUCED_MS : AUTO_NEXT_MS)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <Screen bg="var(--deep)" dark label="스플래시">
      <button type="button" className={styles.skip} aria-label="건너뛰기" onClick={() => go('home')}>
        <span className={styles.blob} aria-hidden />

        <span className={styles.wallet} aria-hidden>
          <span className={styles.back} />
          {TICKETS.map((tone, i) => (
            <span key={tone} className={cn(styles.ticket, styles[tone], styles[`t${i}`])} />
          ))}
          <span className={styles.front}>
            <span className={styles.clasp} />
          </span>
        </span>

        <span className={styles.copy}>
          <span className={styles.brand}>TripOff</span>
          <span className={styles.headline}>
            예약은 따로,
            <br />
            관리는 한곳에서
          </span>
        </span>
      </button>
    </Screen>
  )
}
