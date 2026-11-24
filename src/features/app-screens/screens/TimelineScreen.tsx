import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import Avatar from '../parts/Avatar'
import LiveBadge from '../parts/LiveBadge'
import PlanIcon from '../parts/PlanIcon'
import Screen from '../parts/Screen'
import TabBar from '../parts/TabBar'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { sourceLine, type Plan } from '../mock'
import { hasVoucher, planPhase, setDemoState, tripPlans, useCurrentTrip, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './TimelineScreen.module.css'
import h from '@/features/demo/highlight.module.css'

/** 스크롤 영역 시작 y (날짜 탭 아래). 카드 위치는 Figma y − 이 값 */
const BODY_TOP = 212
const CARD_H = 76

interface Props extends ScreenProps {
  /** 바우처 추가 바텀시트 등 위에 덮을 레이어 */
  overlay?: ReactNode
}

/** 카드·경고·「일정 추가」 위치 계산 (12일 오사카는 Figma 좌표와 같게 나옴) */
function layout(plans: Plan[]) {
  let y = 228 - BODY_TOP
  const cards: Array<{ plan: Plan; top: number; warnTop?: number }> = []
  for (const plan of plans) {
    const top = y
    const bottom = top + CARD_H
    if (plan.warnAfter) {
      cards.push({ plan, top, warnTop: bottom + 24 })
      y = bottom + 76
    } else {
      cards.push({ plan, top })
      y = bottom + 14
    }
  }
  return { cards, addTop: y + 14 }
}

/** Figma 18:232 「타임라인」 — 선택한 여행의 일정. 여행사 일정은 배지로 구분 */
export default function TimelineScreen({ go, toast: initialToast, overlay }: Props) {
  const demo = useDemoState()
  const { dayIndex, saved } = demo
  const trip = useCurrentTrip()
  const [toast, showToast] = useToast(initialToast)
  const dayIdx = Math.min(dayIndex, trip.days.length - 1)

  const add = () => { setDemoState({ voucherTarget: undefined, draft: undefined, addSolo: undefined }); go('add-voucher') }
  const plans = tripPlans(trip, demo).filter((p) => p.day === dayIdx)
  const { cards, addTop } = layout(plans)

  /** 모든 일정 → 일정 상세 (바우처 보기·수정·등록) */
  const open = (p: Plan) => {
    setDemoState({ planId: p.id })
    go('plan')
  }

  return (
    <Screen bg="var(--mist)" label="타임라인">
      <header className={styles.header}>
        <h1 className={styles.title} title={trip.name}>{trip.name}</h1>
        <div className={styles.headerActions}>
          <button type="button" className={cn(styles.members, shared.tappable)} aria-label="함께 가는 사람" onClick={() => go('companions')} data-tap="go:companions">
            {trip.members.map((m) => (
              <Avatar key={m.name} label={m.label} name={m.name} tone={m.pending ? 'off' : m.tone} size={26} fontSize={12} ring={{ width: 2, color: 'var(--mist)' }} />
            ))}
          </button>
          <button type="button" className={cn(styles.addBtn, shared.tappable)} onClick={add} data-tap="go:voucher-import">
            + 바우처
          </button>
        </div>
      </header>

      <div className={styles.days} role="tablist" aria-label="날짜">
        {trip.days.map((d, i) => (
          <button
            key={`${trip.id}-${i}`}
            type="button"
            role="tab"
            aria-selected={i === dayIdx}
            className={cn(styles.day, i === dayIdx && styles.dayActive, shared.tappable)}
            onClick={() => setDemoState({ dayIndex: i })}
          >
            <span className={styles.dow}>{d.dow}</span>
            <span className={styles.date}>{d.date}</span>
          </button>
        ))}
      </div>

      {/* key 로 여행·날짜가 바뀔 때마다 카드 등장 애니메이션 */}
      <div key={`${trip.id}-${dayIdx}`} className={styles.body} role="tabpanel">
        <div className={styles.content} style={{ height: addTop + 48 + 120 }}>
          <span className={styles.rail} style={{ height: addTop + 48 - 20 }} aria-hidden />

          {cards.map(({ plan, top, warnTop }) => {
            const agencyName = plan.source.kind === 'agency' ? plan.source.name : undefined
            // 방금 저장한 샘플 바우처, 방금 상점에서 사서 넣은 일정
            const justAdded = (plan.sample && saved[trip.id]) || (plan.id.startsWith('shop-') && plan.id === demo.planId)
            const phase = planPhase(plan, trip, demo)
            return (
              <div key={plan.id}>
                <div className={styles.item} style={{ top }}>
                  <span className={styles.time}>{plan.time}</span>
                  <span className={cn(styles.dot, plan.conflict && styles.dotCoral)} aria-hidden />
                  <button
                    type="button"
                    className={cn(styles.card, justAdded && h.fresh, plan.conflict && styles.cardConflict, phase === 'live' && styles.cardLive, phase === 'past' && styles.cardPast, shared.tappable)}
                    onClick={() => open(plan)}
                  >
                    <PlanIcon kind={plan.icon} coral={plan.conflict} agency={agencyName} />
                    <span className={styles.text}>
                      <strong>{plan.title}</strong>
                      <span className={styles.sub}>
                        {phase === 'live' && <LiveBadge />}
                        {justAdded && <em className={styles.justAdded}>방금 추가</em>}
                        {!hasVoucher(plan, demo) && <em className={styles.noVoucher}>바우처 없음</em>}
                        <span className={styles.subText}>{sourceLine(plan)}</span>
                      </span>
                    </span>
                  </button>
                </div>
                {plan.warnAfter && warnTop !== undefined && (
                  <button
                    type="button"
                    className={cn(styles.warn, shared.tappable)}
                    style={{ top: warnTop }}
                    onClick={() => showToast(plan.warnAfter!.detail)}
                  >
                    <span className={styles.warnIcon} aria-hidden>
                      !
                    </span>
                    {plan.warnAfter.text}
                  </button>
                )}
              </div>
            )
          })}

          <div className={styles.item} style={{ top: addTop }}>
            <span className={cn(styles.time, styles.timeMuted)}>21:00</span>
            <span className={styles.dotGray} aria-hidden />
            <button type="button" className={cn(styles.add, shared.tappable)} onClick={add}>
              일정 추가
            </button>
          </div>

        </div>
      </div>

      {!overlay && <TabBar active="home" inside go={go} />}
      {toast}
      {overlay}
    </Screen>
  )
}
