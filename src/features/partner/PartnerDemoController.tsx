import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { FloatingBack, SCREEN_BY_ID, resetDemoState, type GoOptions, type ScreenId } from '@/features/app-screens'
import { setDemoState } from '@/features/app-screens/store'
import { countryOf, destinationOf } from '@/data/shopCountries'
import PhoneFrame from '@/features/demo/PhoneFrame'
import FlowPanel from '@/features/demo/FlowPanel'
import { FLOW, PARTNER_OFFSET, PARTNER_STEPS, demoStepUrl, isAppStep } from '@/features/demo/demoFlow'
import { clearDemoNotifications } from '@/data/demoNotifications'
import { tapKey, tapThen } from '@/features/demo/tap'
import { confirmClearDemoCache } from '@/features/demo/clearCache'
import { ROUTES } from '@/lib/routes'
import { loadPartnerProducts, useProductStore } from './productStore'
import { resetPartnerVouchers, usePartnerVouchers } from './voucherStore'
import { useStepAction } from '@/features/demo/stepAction'
import s from './PartnerDemoController.module.css'

/** 폰 화면 → 전체 흐름 단계 */
const PHONE_STEP: Partial<Record<ScreenId, number>> = {
  shop: PARTNER_OFFSET + 2, 'shop-product': PARTNER_OFFSET + 3, 'shop-checkout': PARTNER_OFFSET + 3,
  notifications: PARTNER_OFFSET + 5, plan: PARTNER_OFFSET + 5,
}

/** 주소 → 전체 흐름 단계 (없으면 -1) */
function routeStep(path: string) {
  const i = PARTNER_STEPS.findIndex(step => 'route' in step && (step.route === path || step.also === path))
  return i < 0 ? -1 : PARTNER_OFFSET + i
}

interface PhoneNav { current: ScreenId; history: ScreenId[]; toast?: string; nonce: number }

/**
 * 파트너센터 오른쪽 시연 컨트롤러. /demo 의 고객 앱 단계에 이어 파트너센터 단계를 진행한다.
 * 고객 앱이 필요한 단계는 컨트롤러 왼쪽에 폰을 띄운다.
 */
export default function PartnerDemoController({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { pathname } = location
  const { resetProducts } = useProductStore()
  const vouchers = usePartnerVouchers()
  const flowStep = (location.state as { flowStep?: number } | null)?.flowStep
  const [index, setIndex] = useState(() => flowStep ?? Math.max(PARTNER_OFFSET, routeStep(pathname)))
  const [phone, setPhone] = useState<PhoneNav | null>(null)
  // 화면 기능을 다음 버튼으로 대신 실행 (예시 채우기 → 등록, 시연 결제, 지금 발송, 알림 열기)
  const action = useStepAction(FLOW[index]?.act)

  // 사이드바나 폰 안에서 직접 이동해도 단계 표시를 맞춘다 (렌더 중 이전 값과 비교해 갱신)
  const where = phone ? 'phone:' + phone.current : pathname + ':' + (flowStep ?? '')
  const [seen, setSeen] = useState(where)
  if (seen !== where) {
    setSeen(where)
    const found = phone ? PHONE_STEP[phone.current] : flowStep ?? routeStep(pathname)
    if (found !== undefined && found >= 0) setIndex(found)
  }

  const go = useCallback((id: ScreenId, options?: GoOptions) => {
    setPhone(n => n && {
      current: id,
      history: options?.replace ? n.history : [...n.history, n.current],
      toast: options?.toast,
      nonce: n.nonce + 1,
    })
  }, [])
  const back = useCallback(() => {
    setPhone(n => {
      if (!n) return n
      if (!n.history.length) return null
      return { current: n.history.at(-1)!, history: n.history.slice(0, -1), nonce: n.nonce + 1 }
    })
  }, [])

  const select = (i: number) => {
    // 고객 앱 단계(처음 단계들과 마무리)는 /demo 로 돌아가서 이어 간다
    if (isAppStep(FLOW[i])) {
      navigate(demoStepUrl(i))
      return
    }
    const step = PARTNER_STEPS[i - PARTNER_OFFSET]
    setIndex(i)
    if ('route' in step) {
      setPhone(null)
      // 바우처 발송: 상점에서 막 들어온 발송 대기 바우처를 바로 선택
      const latest = vouchers.find(v => v.planId && v.status === 'pending') ?? vouchers.find(v => v.status === 'pending')
      const selectId = step.route === ROUTES.partnerVouchers ? latest?.id : undefined
      // 사이드바 메뉴를 누르는 모션 뒤에 이동 (상품 등록은 「새 상품 등록」 화면이라 메뉴 대신 바로)
      const move = () => navigate(step.route, { state: { flowStep: i, selectId } })
      // 이전으로 돌아갈 때는 모션 없이 바로
      if (i > index) tapThen(tapKey('nav:' + step.route), move)
      else move()
      return
    }
    // 가장 최근에 등록한 파트너 상품을 고객 상점에서 보여 준다
    const product = loadPartnerProducts()[0]
    if (product) {
      const country = product.country || countryOf(product.region)
      setDemoState({ shopCountry: country, shopDestination: product.destination || destinationOf(product.region), shopProductId: product.id })
    }
    setPhone(n => ({ current: step.phone, history: [], nonce: (n?.nonce ?? 0) + 1 }))
  }

  const reset = () => {
    if (!window.confirm('등록한 상품, 바우처, 고객 앱 시연 기록을 모두 처음 상태로 되돌리고 처음 화면으로 갈까요?')) return
    resetProducts()
    resetPartnerVouchers()
    resetDemoState()
    clearDemoNotifications()
    setPhone(null)
    navigate(ROUTES.demo)
  }

  const meta = phone ? SCREEN_BY_ID[phone.current] : undefined
  const Screen = meta?.Component

  return (
    <>
      {open ? (
        <aside className={s.column}>
          <div className={s.sticky}>
            <FlowPanel index={index} onSelect={select} action={action} now={meta ? '고객 앱 · ' + meta.title : undefined}>
              <button type="button" className={s.option} onClick={reset}>↻ 시연 처음 상태로</button>
              <button type="button" className={s.option} onClick={confirmClearDemoCache}>캐시 지우기</button>
              <button type="button" className={s.option} onClick={() => onOpenChange(false)}>컨트롤러 숨기기</button>
            </FlowPanel>
          </div>
        </aside>
      ) : (
        <button type="button" className={s.pill} onClick={() => onOpenChange(true)}>
          시연 {index + 1}/{FLOW.length} · {FLOW[index]?.title}
        </button>
      )}

      {phone && Screen && meta && (
        <div className={s.phoneLayer} role="dialog" aria-modal="false" aria-label="고객 앱 화면">
          <div className={s.phoneHead}>
            <span>고객 앱 · {meta.title}</span>
            <button type="button" onClick={() => setPhone(null)}>닫기 ✕</button>
          </div>
          <PhoneFrame screenKey={phone.nonce}>
            <div className={s.screen}>
              <Screen key={phone.nonce} go={go} back={back} toast={phone.toast} />
              {meta.floatingBack && <FloatingBack key={`b-${phone.nonce}`} onClick={back} {...meta.floatingBack} />}
            </div>
          </PhoneFrame>
        </div>
      )}
    </>
  )
}
