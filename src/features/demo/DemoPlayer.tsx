import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { allTrips, getDemoState, setDemoState } from '@/features/app-screens/store'
import { FloatingBack, SCREENS, SCREEN_BY_ID, resetDemoState, type GoOptions, type ScreenId } from '@/features/app-screens'
import { cn } from '@/lib/cn'
import { ROUTES } from '@/lib/routes'
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

const DEMO_STEPS: { title: string; description: string; entry: ScreenId; screens: ScreenId[] }[] = [
  { title: '여행 확인', description: '여러 곳에서 예약한 일정을 하나의 여행에서 확인해요.', entry: 'home', screens: ['splash', 'home', 'add-trip', 'timeline', 'plan', 'profile', 'notifications'] },
  { title: '바우처 등록', description: '샘플을 선택하고 예약 정보를 확인한 뒤, 한 번에 여행에 저장해요.', entry: 'voucher-import', screens: ['add-voucher', 'voucher-import', 'review', 'voucher-original'] },
  { title: '현장에서 사용', description: '다가오는 일정을 확인하고, 저장한 내 QR을 크게 열어요.', entry: 'trip-home', screens: ['trip-home', 'ticket', 'lock'] },
  { title: '상점 둘러보기', description: '상품 선택부터 시연 결제, 일정 저장까지 확인해요.', entry: 'shop', screens: ['shop', 'shop-product', 'shop-checkout'] },
  { title: '동행 관리', description: '동행을 초대하고 함께하는 일정과 정산 내역을 확인해요.', entry: 'companions', screens: ['companions', 'invite'] },
]

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
  const index = DEMO_STEPS.findIndex(step => step.screens.includes(nav.current))

  return (
    <div className={styles.root}>
      <PhoneFrame immersive screenKey={nav.nonce} showBottom={nav.current === 'add-voucher'}>
        <div className={styles.screen}>
          <Component key={nav.nonce} go={go} back={back} toast={nav.toast} />
          {meta.floatingBack && <FloatingBack key={`b-${nav.nonce}`} onClick={back} {...meta.floatingBack} />}

        </div>
      </PhoneFrame>

      <div className={styles.side}>
        <p className={styles.step}>
          핵심 시연 · {index + 1} / {DEMO_STEPS.length}
        </p>
        <h2 className={styles.title}>
          예약부터 입장까지
        </h2>
        <p className={styles.caption}>네 가지 흐름으로 트립오프를 만나보세요.</p>

        <ol className={styles.list}>
          {DEMO_STEPS.map((s, i) => (
            <li key={s.entry}>
              <button
                type="button"
                className={cn(styles.item, i === index && styles.active)}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => go(s.entry)}
              >
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.stepCopy}><strong>{s.title}</strong><span>{s.description}</span></span>
              </button>
            </li>
          ))}
        </ol>

        <div className={styles.current} aria-live="polite"><span>지금 화면 · {meta.title}</span><p>{meta.caption}</p></div>

        <div className={styles.nav}>
          <button type="button" disabled={index <= 0} onClick={() => go(DEMO_STEPS[index - 1].entry)}>
            이전 단계
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={index >= DEMO_STEPS.length - 1}
            onClick={() => go(DEMO_STEPS[index + 1].entry)}
          >
            다음 단계
          </button>
        </div>
        <details className={styles.details}><summary>세부 화면 바로가기</summary><div className={styles.shortcuts}>{SCREENS.map(s => <button key={s.id} type="button" aria-current={s.id === nav.current ? 'page' : undefined} onClick={() => go(s.id)}>{s.title}</button>)}</div></details>
        <button type="button" className={styles.restart} onClick={restart}>
          ↻ 처음부터 다시
        </button>
        <p className={styles.hint}>폰 화면 안의 버튼·카드·탭도 모두 눌러 보세요.</p><Link className={styles.hint} to={ROUTES.partner}>관리자 화면(파트너센터) 보기 →</Link>
      </div>
    </div>
  )
}
