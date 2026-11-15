import { useEffect, useId, useRef, type CSSProperties } from 'react'
import Screen from '../parts/Screen'
import type { ScreenProps } from '../types'
import styles from './SplashScreen.module.css'

/** 애니메이션 끝나고 홈으로 넘어가는 시점 (ms) */
const AUTO_NEXT_MS = 1050
const AUTO_NEXT_REDUCED_MS = 300

/** 티켓이 새 로고의 포켓에 내려앉은 뒤 홈으로 이동한다. */
export default function SplashScreen({ go }: ScreenProps) {
  const ticketMaskId = useId()
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
    <Screen bg="#F5F7F7" label="스플래시">
      <button type="button" className={styles.skip} aria-label="건너뛰기" onClick={() => go('home')}>
        <span className={styles.wallet} aria-hidden>
          <svg viewBox="347 167 385 387" width="132" height="133" focusable="false">
            <defs>
              <mask id={ticketMaskId} maskUnits="userSpaceOnUse" x="100" y="-500" width="800" height="1100">
                <path fill="white" d="M100-500H900V164.7L100 440.2Z" />
              </mask>
            </defs>
            {/* 티켓 전체를 움직이고, 지갑 입구 아래로 들어간 부분만 가린다. */}
            <g mask={`url(#${ticketMaskId})`}>
              {['#EAC976', '#83BFBB', '#F4B295', '#FF7955'].map((color, index) => <path
                key={color}
                className={`${styles.ticket} ${index === 3 ? styles.lastTicket : styles.passingTicket}`}
                style={{ '--delay': `${index * 0.1}s`, '--entry-x': `${index % 2 ? 100 : -100}px`, '--entry-angle': `${index % 2 ? 16 : -16}deg` } as CSSProperties}
                fill={color}
                d="M407 430 381.6 256Q378 219 411 210L488 194C490 211 503 223 519 223 539 223 552 205 547 181L607 168Q646 161 654 201L676 365Q680 400 646 408L445 454Q411 464 407 430Z"
              />)}
            </g>
            <path fill="#00A7A0" d="M348 420Q348 384 378 373L710 255Q723 251 728 257Q733 262 730 276L694 500Q687 553 641 553H411Q348 553 348 491Z" />
          </svg>
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
