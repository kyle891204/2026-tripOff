import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import Avatar from '../parts/Avatar'
import LiveBadge from '../parts/LiveBadge'
import PlanIcon from '../parts/PlanIcon'
import Screen from '../parts/Screen'
import TabBar from '../parts/TabBar'
import { IconChevronRight } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { dateAt, type Plan, type Trip } from '../mock'
import { allTrips, companionVouchers, getDemoState, hasVoucher, planPhase, setDemoState, soloTrips, tripPlans, useDemoState, type PlanPhase } from '../store'
import type { ScreenProps } from '../types'
import h from '@/features/demo/highlight.module.css'
import styles from './VouchersScreen.module.css'

type Sheet = 'mine' | 'companion'
type Seg = 'mine' | 'theirs'
type Item = { trip: Trip; plan: Plan; date: string }
const SOLO_FILTER = 'solo'
const byDate = (a: Item, b: Item) => a.date.localeCompare(b.date) || a.plan.time.localeCompare(b.plan.time)

/**
 * 「일정」 탭 — 모든 여행의 일정을 날짜별로 한곳에서.
 * - 여행에 넣지 않은 일정(여행 외)도 함께 날짜순으로
 * - 내 일정 추가: 여행을 고르거나 「여행에 넣지 않기」로 기존 바우처 추가 흐름으로
 * - 일행 일정 추가: 여행·동행을 고르고 대신 받아 둔 바우처를 그 사람 몫으로 저장 (내 티켓에는 안 섞임)
 */
export default function VouchersScreen({ go, toast: initialToast, overlay }: ScreenProps & { overlay?: ReactNode }) {
  const demo = useDemoState()
  const trips = allTrips(demo)
  const [filter, setFilter] = useState<string>('all')
  const [seg, setSeg] = useState<Seg>(() => (initialToast?.includes('님 일정') ? 'theirs' : 'mine'))
  const [sheet, setSheet] = useState<Sheet>()
  const [toast] = useToast(initialToast)

  // 다른 흐름에서 중간에 빠져나와도 일행 대상이 남지 않게
  useEffect(() => { if (!overlay && (getDemoState().voucherOwner || getDemoState().addSolo)) setDemoState({ voucherOwner: undefined, addSolo: undefined }) }, [overlay])

  const solos = soloTrips(demo)
  const item = (trip: Trip) => (plan: Plan): Item => ({ trip, plan, date: dateAt(trip, plan.day) })
  const shown = trips.filter((t) => filter === 'all' || t.id === filter)
  const mine: Item[] = [
    ...shown.flatMap((trip) => tripPlans(trip, demo).map(item(trip))),
    ...(filter === 'all' || filter === SOLO_FILTER ? solos.flatMap((trip) => tripPlans(trip, demo).map(item(trip))) : []),
  ].sort(byDate)
  const theirs: Item[] = filter === SOLO_FILTER ? [] : shown.flatMap((trip) => companionVouchers(trip, demo).map(item(trip))).sort(byDate)
  const items = seg === 'mine' ? mine : theirs
  const live = items.filter(({ trip, plan }) => planPhase(plan, trip, demo) === 'live')

  // 날짜별로 묶기 (같은 날이라도 여행이 다르면 따로, 여행 밖 일정은 같은 날끼리)
  const groups: { key: string; trip: Trip; day: number; items: Item[] }[] = []
  for (const it of items) {
    const key = `${it.date}-${it.trip.solo ? SOLO_FILTER : it.trip.id}`
    const last = groups.at(-1)
    if (last?.key === key) last.items.push(it)
    else groups.push({ key, trip: it.trip, day: it.plan.day, items: [it] })
  }

  const openPlan = (trip: Trip, plan: Plan) => {
    setDemoState({ tripId: trip.id, dayIndex: plan.day, planId: plan.id, voucherTarget: undefined, draft: undefined })
    go('plan')
  }

  return (
    <Screen bg="var(--mist)" label="일정">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>일정</h1>
          <p>여행별 일정과 바우처를 한곳에서 봐요</p>
        </header>

        <div className={styles.actions}>
          <button type="button" className={cn(styles.action, styles.actionMine, shared.tappable)} onClick={() => setSheet('mine')}>
            <span className={styles.plus} aria-hidden>+</span>내 일정 추가
          </button>
          <button type="button" className={cn(styles.action, shared.tappable)} onClick={() => setSheet('companion')}>
            <span className={styles.plus} aria-hidden>+</span>일행 일정 추가
          </button>
        </div>

        <div className={styles.segment} role="tablist" aria-label="일정 종류">
          <button type="button" role="tab" aria-selected={seg === 'mine'} onClick={() => setSeg('mine')}>
            내 일정 <span>{mine.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={seg === 'theirs'} onClick={() => setSeg('theirs')}>
            일행 일정 <span>{theirs.length}</span>
          </button>
        </div>

        <div className={styles.filters} role="group" aria-label="여행 선택">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>전체</button>
          {trips.map((t) => (
            <button key={t.id} type="button" aria-pressed={filter === t.id} onClick={() => setFilter(t.id)}>{t.name}</button>
          ))}
          {solos.length > 0 && <button type="button" aria-pressed={filter === SOLO_FILTER} onClick={() => setFilter(SOLO_FILTER)}>여행 외</button>}
        </div>

        <div className={styles.body}>
          {live.length > 0 && (
            <section className={styles.now}>
              <h2 className={styles.date}><strong>지금 진행 중</strong></h2>
              {live.map(({ trip, plan }) => (
                <button key={plan.id} type="button" className={cn(styles.nowCard, shared.tappable)} onClick={() => openPlan(trip, plan)}>
                  <PlanIcon kind={plan.icon} agency={plan.source.kind === 'agency' ? plan.source.name : undefined} />
                  <span className={styles.nowText}>
                    <strong>{plan.title}</strong>
                    <span>{plan.time} 시작 · {plan.location ?? trip.name}</span>
                  </span>
                  <LiveBadge />
                </button>
              ))}
            </section>
          )}
          {groups.map((g) => {
            const d = g.trip.days[g.day]
            return (
              <section key={g.key} className={styles.group}>
                <h2 className={styles.date}>
                  <strong>{g.trip.month}.{d?.date}</strong> {d?.dow}
                  <span className={cn(styles.tripTag, g.trip.solo && styles.soloTag)}>{g.trip.solo ? '여행 외' : g.trip.name}</span>
                </h2>
                <ul className={styles.card}>
                  {g.items.map(({ trip, plan }) => (
                    <PlanRow key={plan.id} trip={trip} plan={plan} phase={planPhase(plan, trip, demo)} missing={!plan.owner && !hasVoucher(plan, demo)} fresh={plan.id.startsWith('shop-') && plan.id === demo.planId} onOpen={() => openPlan(trip, plan)} />
                  ))}
                </ul>
              </section>
            )
          })}
          {groups.length === 0 && (
            <div className={styles.empty}>
              <strong>{seg === 'mine' ? '아직 일정이 없어요' : '일행 일정이 없어요'}</strong>
              <p>{seg === 'mine' ? '「내 일정 추가」로 예약한 바우처를 모아 보세요.' : '동행 대신 받아 둔 바우처를 추가하면 그 사람 몫으로 따로 보관돼요.'}</p>
            </div>
          )}
        </div>
      </div>

      {sheet && <AddSheet kind={sheet} trips={trips} defaultTrip={demo.tripId} onClose={() => setSheet(undefined)} onNext={(trip, owner) => {
        setDemoState({ tripId: trip?.id ?? demo.tripId, voucherTarget: undefined, draft: undefined, voucherOwner: owner, addSolo: !trip || undefined })
        go(owner ? 'voucher-import' : 'add-voucher')
      }} />}

      <TabBar active="vouchers" go={go} />
      {toast}
      {overlay}
    </Screen>
  )
}

/** fresh: 방금 상점에서 사서 내 일정에 들어온 일정 (강조) */
function PlanRow({ trip, plan, phase, missing, fresh, onOpen }: { trip: Trip; plan: Plan; phase: PlanPhase; missing: boolean; fresh?: boolean; onOpen: () => void }) {
  const member = plan.owner ? trip.members.find((m) => m.name === plan.owner) : undefined
  return (
    <li>
      <button type="button" className={cn(styles.row, phase === 'past' && styles.rowPast, fresh && h.fresh)} onClick={onOpen}>
        <span className={cn(styles.time, phase === 'live' && styles.timeLive)}>{plan.time}</span>
        <PlanIcon kind={plan.icon} agency={plan.source.kind === 'agency' ? plan.source.name : undefined} />
        <span className={styles.rowText}>
          <strong>{plan.title}</strong>
          {phase === 'live' ? <span className={styles.liveLine}><LiveBadge /></span> : missing ? <span className={styles.missing}>바우처 등록 필요</span> : <span>{plan.location ?? (plan.source.kind === 'agency' ? plan.source.name : plan.source.via)}</span>}
        </span>
        {member ? (
          <span className={styles.owner}>
            <Avatar label={member.label} name={member.name} tone={member.tone} size={22} fontSize={10} />
            {member.name}
          </span>
        ) : (
          <IconChevronRight />
        )}
      </button>
    </li>
  )
}

function AddSheet({ kind, trips, defaultTrip, onClose, onNext }: {
  kind: Sheet
  trips: Trip[]
  defaultTrip: string
  onClose: () => void
  /** trip 이 없으면 여행에 넣지 않고 내 일정으로 */
  onNext: (trip: Trip | undefined, owner?: string) => void
}) {
  // 내 일정: 처음엔 아무 여행도 고르지 않은 상태 → 그대로 가면 여행 밖 일정. 고른 칩을 다시 누르면 해제
  const [tripId, setTripId] = useState<string | undefined>(kind === 'mine' ? undefined : trips.some((t) => t.id === defaultTrip) ? defaultTrip : trips[0]?.id)
  const solo = kind === 'mine' && !tripId
  const trip = solo ? undefined : trips.find((t) => t.id === tripId) ?? trips[0]
  const companions = trip ? trip.members.filter((m) => !m.me) : []
  const [owner, setOwner] = useState<string>()
  const chosen = companions.find((m) => m.name === owner)
  const ready = kind === 'mine' ? solo || !!trip : !!trip && !!chosen
  const title = kind === 'mine' ? '내 일정 추가' : '일행 일정 추가'

  return (
    <>
      <button type="button" className={styles.dim} aria-label="닫기" onClick={onClose} />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={title}>
        <span className={styles.handle} aria-hidden />
        <h2 className={styles.sheetTitle}>{title}</h2>
        <p className={styles.sheetSub}>
          {kind === 'mine' ? '여행에 넣으려면 여행을 골라 주세요. 고르지 않아도 되고, 나중에 일정에서 넣을 수 있어요.' : '동행 대신 받은 바우처를 그 사람 몫으로 보관해요. 내 티켓에는 섞이지 않아요.'}
        </p>

        <h3 className={styles.label}>여행{kind === 'mine' && <small className={styles.optional}> · 선택</small>}</h3>
        <div className={styles.chips}>
          {trips.map((t) => (
            <button key={t.id} type="button" aria-pressed={t.id === trip?.id} onClick={() => { setTripId(kind === 'mine' && t.id === tripId ? undefined : t.id); setOwner(undefined) }}>
              {t.name}
            </button>
          ))}
        </div>
        {solo && <p className={styles.sheetSub}>여행 없이 일정 탭에 날짜별로 보관돼요. 날짜가 여행 기간과 겹치면 그 여행에 넣을지 물어볼게요.</p>}

        {kind === 'companion' && (
          <>
            <h3 className={styles.label}>누구의 일정인가요?</h3>
            {companions.length ? (
              <div className={styles.chips}>
                {companions.map((m) => (
                  <button key={m.name} type="button" className={styles.memberChip} aria-pressed={m.name === owner} onClick={() => setOwner(m.name)}>
                    <Avatar label={m.label} name={m.name} tone={m.tone} size={24} fontSize={11} />
                    {m.name}{m.pending && <small>수락 대기</small>}
                  </button>
                ))}
              </div>
            ) : (
              <p className={styles.sheetSub}>이 여행에는 아직 동행이 없어요. 동행을 먼저 초대해 주세요.</p>
            )}
          </>
        )}

        <button type="button" className={cn(styles.next, shared.tappable)} disabled={!ready} onClick={() => ready && onNext(trip, kind === 'companion' ? chosen?.name : undefined)}>
          {kind === 'mine' ? '바우처 가져오기' : chosen ? `${chosen.name}님 바우처 가져오기` : '동행을 선택해 주세요'}
        </button>
      </div>
    </>
  )
}
