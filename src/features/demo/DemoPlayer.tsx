import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { allTrips, getDemoState, setDemoState, useDemoState } from '@/features/app-screens/store'
import { FloatingBack, SCREENS, SCREEN_BY_ID, resetDemoState, type GoOptions, type ScreenId } from '@/features/app-screens'
import { ROUTES } from '@/lib/routes'
import PhoneFrame from './PhoneFrame'
import FlowPanel from './FlowPanel'
import { useStepAction } from './stepAction'
import { tapKey, tapThen } from './tap'
import { confirmClearDemoCache } from './clearCache'
import { FLOW, isAppStep, type PartnerStep } from './demoFlow'
import { resetPartnerProducts } from '@/features/partner/productStore'
import { resetPartnerVouchers } from '@/features/partner/voucherStore'
import { clearDemoNotifications } from '@/data/demoNotifications'
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

/** 「시연 시각」 — 이 시각에 진행 중인 일정이 앱 곳곳에 「진행 중」으로 표시됨 (오사카 여행 기준) */
const DEMO_TIMES: { value: string; label: string; day?: number }[] = [
  { value: '', label: '여행 전 · 6.7 일 (D-5)' },
  { value: '2026-06-12T10:00', label: '6.12 금 10:00 · 간사이행 비행 중', day: 0 },
  { value: '2026-06-12T15:00', label: '6.12 금 15:00 · 난바행 셔틀', day: 0 },
  { value: '2026-06-12T18:50', label: '6.12 금 18:50 · 리버 크루즈', day: 0 },
  { value: '2026-06-13T13:30', label: '6.13 토 13:30 · 호즈강 뱃놀이', day: 1 },
  { value: '2026-06-14T11:30', label: '6.14 일 11:30 · 가이유칸 수족관', day: 2 },
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
 * 시연 플레이어: 처음엔 폰이 닫혀 있고, 「시작하기」를 누르면 스플래시부터 시작.
 * 오른쪽 컨트롤러의 「다음」으로 고객 앱 단계를 넘기고, 이어서 파트너센터로 넘어간다.
 * 폰 안에서 직접 눌러 이동해도 된다.
 */
export default function DemoPlayer() {
  const [query] = useSearchParams()
  const navigate = useNavigate()
  const inviteTrip = query.get('trip')
  // 파트너센터에서 「이전」으로 돌아오면 ?step=5 처럼 그 단계로 바로 연다
  const stepParam = Number(query.get('step')) - 1
  const resumeStep = isAppStep(FLOW[stepParam]) ? stepParam : -1
  const invited = !!inviteTrip && allTrips().some(t => t.id === inviteTrip)

  const [started, setStarted] = useState(invited || resumeStep >= 0)
  const [index, setIndex] = useState(resumeStep)
  const [nav, setNav] = useState<Nav>(() => ({
    current: invited ? 'timeline' : isAppStep(FLOW[resumeStep]) ? FLOW[resumeStep].entry : 'splash',
    history: resumeStep > 0 ? ['home'] : [],
    nonce: 0,
  }))
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

  const start = () => {
    setStarted(true)
    setIndex(-1)
    setNav((n) => ({ current: 'splash', history: [], nonce: n.nonce + 1 }))
  }

  const select = (i: number) => {
    const step = FLOW[i]
    // 파트너센터 단계: 같은 컨트롤러가 파트너센터 오른쪽에서 이어진다
    if (!isAppStep(step)) {
      const partner: PartnerStep = step
      navigate('route' in partner ? partner.route : ROUTES.partnerProducts, { state: { flowStep: i } })
      return
    }
    // 현장 사용처럼 시각이 중요한 단계는 시연 시각도 함께 맞춘다
    if (step.shop) setDemoState({ shopCountry: step.shop.country, shopDestination: step.shop.destination, shopProductId: undefined, shopBooking: undefined })
    if (step.demoNow !== undefined) setDemoState({ demoNow: step.demoNow || undefined, ...(step.day !== undefined ? { tripId: 'osaka', dayIndex: step.day } : {}) })
    setStarted(true)
    setIndex(i)
    // 앞으로 갈 때만: 폰 화면에 그 기능으로 가는 버튼(탭 등)이 보이면 누르는 모션 뒤에 이동. 이전으로는 바로 이동
    if (i > index) tapThen(tapKey('go:' + step.entry), () => go(step.entry))
    else go(step.entry)
  }

  const restart = () => {
    resetDemoState()
    resetPartnerProducts()
    resetPartnerVouchers()
    clearDemoNotifications()
    setStarted(false)
    setIndex(-1)
    setNav((n) => ({ current: 'splash', history: [], nonce: n.nonce + 1 }))
  }

  // 바우처 등록처럼 화면 기능을 보여 줄 단계는 다음 버튼이 그 기능을 대신 실행
  const action = useStepAction(index >= 0 ? FLOW[index].act : undefined)
  const demoNow = useDemoState().demoNow ?? ''
  const meta = SCREEN_BY_ID[nav.current]
  const { Component } = meta

  return (
    <div className={styles.root}>
      <PhoneFrame immersive screenKey={nav.nonce} showBottom={nav.current === 'add-voucher'}>
        <div className={styles.screen}>
          {started ? <>
            <Component key={nav.nonce} go={go} back={back} toast={nav.toast} />
            {meta.floatingBack && <FloatingBack key={`b-${nav.nonce}`} onClick={back} {...meta.floatingBack} />}
          </> : (
            <div className={styles.cover}>
              <p className={styles.coverLogo}>TripOff</p>
              <p className={styles.coverCopy}>예약은 따로, 관리는 한곳에서</p>
              <button type="button" className={styles.coverStart} onClick={start}>시작하기</button>
            </div>
          )}
        </div>
      </PhoneFrame>

      <div className={styles.side}>
        <FlowPanel index={index} started={started} onSelect={select} onStart={start} onRestart={restart} action={action} now={started ? meta.title : undefined}>
          <label className={styles.clock}>
            <span>시연 시각</span>
            <select value={demoNow} onChange={(e) => {
              const t = DEMO_TIMES.find((x) => x.value === e.target.value)
              // 고른 시각의 날짜로 타임라인도 맞춤
              setDemoState({ demoNow: t?.value || undefined, ...(t?.day !== undefined ? { tripId: 'osaka', dayIndex: t.day } : {}) })
            }}>
              {DEMO_TIMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <div className={styles.shortcuts} aria-label="세부 화면 바로가기">
            {SCREENS.map(s => <button key={s.id} type="button" aria-current={s.id === nav.current ? 'page' : undefined} onClick={() => { setStarted(true); go(s.id) }}>{s.title}</button>)}
          </div>
          <button type="button" className={styles.restart} onClick={restart}>↻ 처음부터 다시</button>
          <button type="button" className={styles.restart} onClick={confirmClearDemoCache}>캐시 지우기</button>
          <Link className={styles.hint} to={ROUTES.partner}>파트너센터만 따로 보기 →</Link>
        </FlowPanel>
      </div>
    </div>
  )
}
