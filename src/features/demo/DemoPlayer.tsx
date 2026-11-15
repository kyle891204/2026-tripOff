import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { openDemoNotification, useDemoNotifications } from '@/data/demoNotifications'
import { allTrips, getDemoState, setDemoState } from '@/features/app-screens/store'
import { FloatingBack, SCREENS, SCREEN_BY_ID, resetDemoState, type GoOptions, type ScreenId } from '@/features/app-screens'
import { cn } from '@/lib/cn'
import PhoneFrame from './PhoneFrame'
import styles from './DemoPlayer.module.css'

interface Nav {
  /** 현재 화면 */
  current: ScreenId
  /** 지나온 화면들 (뒤로가기용) */
  history: ScreenId[]
  toast?: string
  /** 같은 화면으로 다시 가도 애니메이션이 다시 돌도록 key 갱신 */
  nonce: number
}

const START: ScreenId = 'splash'

/**
 * 이동 후 방문 기록.
 * - 이미 기록에 있는 화면으로 가면 그 지점까지 되돌림 (예: 바우처 저장 → 타임라인이면 시트·추출 화면은 기록에서 빠짐)
 * - 스플래시, replace 이동은 기록에 남기지 않음
 */
function nextHistory(n: Nav, id: ScreenId, options?: GoOptions): ScreenId[] {
  const seen = n.history.lastIndexOf(id)
  if (seen >= 0) return n.history.slice(0, seen)
  if (n.current === 'splash' || options?.replace) return n.history
  return [...n.history, n.current]
}

/**
 * 시연 플레이어: 폰 안에서 직접 눌러 흐름대로 이동하거나,
 * 오른쪽 목록에서 원하는 화면으로 바로 점프.
 * 자체 뒤로 버튼이 없는 화면에는 앱 화면 안에 플로팅 뒤로가기를 띄운다.
 */
export default function DemoPlayer() {
  const [query] = useSearchParams()
  const inviteTrip = query.get('trip')
  const [nav, setNav] = useState<Nav>(() => ({ current: inviteTrip && allTrips().some(t => t.id === inviteTrip) ? 'timeline' : START, history: [], nonce: 0 }))
  const newest = useDemoNotifications()[0]
  const [dismissed, setDismissed] = useState<string>()
  const banner = newest && !newest.read && newest.id !== dismissed ? newest : undefined
  const bannerId = banner?.id
  useEffect(() => {
    if (!bannerId || nav.current === START) return
    const timer = window.setTimeout(() => setDismissed(bannerId), 10000)
    return () => window.clearTimeout(timer)
  }, [bannerId, nav.current])
  useEffect(() => {
    if (inviteTrip && getDemoState().tripId !== inviteTrip && allTrips().some(t => t.id === inviteTrip)) setDemoState({ tripId: inviteTrip, dayIndex: 0, planId: undefined })
  }, [inviteTrip])

  const go = useCallback((id: ScreenId, options?: GoOptions) => {
    setNav((n) => ({
      current: id,
      history: nextHistory(n, id, options),
      toast: options?.toast,
      nonce: n.nonce + 1,
    }))
  }, [])

  const back = useCallback(() => {
    setNav((n) => ({
      current: n.history.at(-1) ?? 'home',
      history: n.history.slice(0, -1),
      nonce: n.nonce + 1,
    }))
  }, [])

  const restart = () => {
    resetDemoState()
    setNav((n) => ({ current: START, history: [], nonce: n.nonce + 1 }))
  }

  const meta = SCREEN_BY_ID[nav.current]
  const { Component } = meta
  const index = SCREENS.findIndex((s) => s.id === nav.current)

  return (
    <div className={styles.root}>
      <PhoneFrame>
        <div className={styles.screen}>
          <Component key={nav.nonce} go={go} back={back} toast={nav.toast} />
          {meta.floatingBack && <FloatingBack key={`b-${nav.nonce}`} onClick={back} {...meta.floatingBack} />}
          {banner && nav.current !== START && <div className={styles.notification}>
            <span className={styles.srOnly} role="status">{banner.title} {banner.body}</span>
            <button type="button" className={styles.notificationOpen} onClick={() => { setDismissed(banner.id); openDemoNotification(banner, go) }}>
              <small>TripOff · 방금</small><strong>{banner.title}</strong><span>{banner.body}</span>
            </button>
            <button type="button" className={styles.notificationClose} aria-label="알림 배너 닫기" onClick={() => setDismissed(banner.id)}>×</button>
          </div>}
        </div>
      </PhoneFrame>

      <div className={styles.side}>
        <p className={styles.step}>
          {String(index + 1).padStart(2, '0')} / {String(SCREENS.length).padStart(2, '0')}
        </p>
        <h2 className={styles.title}>
          {meta.title}
          {meta.source === 'temp' && <span className={styles.temp}>임시 화면</span>}
        </h2>
        <p className={styles.caption}>{meta.caption}</p>

        <ol className={styles.list}>
          {SCREENS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={cn(styles.item, s.id === nav.current && styles.active)}
                onClick={() => go(s.id)}
              >
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                {s.title}
                {s.source === 'temp' && <span className={styles.tempDot} title="하이파이 없음" />}
              </button>
            </li>
          ))}
        </ol>

        <div className={styles.nav}>
          <button type="button" disabled={index <= 0} onClick={() => go(SCREENS[index - 1].id)}>
            이전 화면
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={index >= SCREENS.length - 1}
            onClick={() => go(SCREENS[index + 1].id)}
          >
            다음 화면
          </button>
        </div>
        <button type="button" className={styles.restart} onClick={restart}>
          ↻ 처음부터 다시
        </button>
        <p className={styles.hint}>폰 화면 안의 버튼·카드·탭도 모두 눌러 보세요.</p>
      </div>
    </div>
  )
}
