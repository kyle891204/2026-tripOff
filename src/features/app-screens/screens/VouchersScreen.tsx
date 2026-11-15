import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import Avatar from '../parts/Avatar'
import PlanIcon from '../parts/PlanIcon'
import Screen from '../parts/Screen'
import TabBar from '../parts/TabBar'
import { IconChevronRight } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import type { Plan, Trip } from '../mock'
import { allTrips, companionVouchers, getDemoState, hasVoucher, setDemoState, tripPlans, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './VouchersScreen.module.css'

type Sheet = 'mine' | 'companion'
type Seg = 'mine' | 'theirs'
type Item = { trip: Trip; plan: Plan }

/**
 * 「일정」 탭 — 모든 여행의 일정을 날짜별로 한곳에서.
 * - 내 일정 추가: 여행을 고르고 기존 바우처 추가 흐름으로
 * - 일행 일정 추가: 여행·동행을 고르고 대신 받아 둔 바우처를 그 사람 몫으로 저장 (내 티켓에는 안 섞임)
 */
export default function VouchersScreen({ go, toast: initialToast }: ScreenProps) {
  const demo = useDemoState()
  const trips = allTrips(demo)
  const [filter, setFilter] = useState<string>('all')
  const [seg, setSeg] = useState<Seg>(() => (initialToast?.includes('님 일정') ? 'theirs' : 'mine'))
  const [sheet, setSheet] = useState<Sheet>()
  const [toast] = useToast(initialToast)

  // 다른 흐름에서 중간에 빠져나와도 일행 대상이 남지 않게
  useEffect(() => { if (getDemoState().voucherOwner) setDemoState({ voucherOwner: undefined }) }, [])

  const shown = trips.filter((t) => filter === 'all' || t.id === filter)
  const mine: Item[] = shown.flatMap((trip) => tripPlans(trip, demo).map((plan) => ({ trip, plan })))
  const theirs: Item[] = shown.flatMap((trip) => companionVouchers(trip, demo).map((plan) => ({ trip, plan })))
  const items = seg === 'mine' ? mine : theirs

  // 날짜별로 묶기 (여행 순서 → 날짜 순서 유지)
  const groups: { key: string; trip: Trip; day: number; items: Item[] }[] = []
  for (const it of items) {
    const key = `${it.trip.id}-${it.plan.day}`
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
        </div>

        <div className={styles.body}>
          {groups.map((g) => {
            const d = g.trip.days[g.day]
            return (
              <section key={g.key} className={styles.group}>
                <h2 className={styles.date}>
                  <strong>{g.trip.month}.{d?.date}</strong> {d?.dow}
                  <span className={styles.tripTag}>{g.trip.name}</span>
                </h2>
                <ul className={styles.card}>
                  {g.items.map(({ trip, plan }) => (
                    <PlanRow key={plan.id} trip={trip} plan={plan} missing={!plan.owner && !hasVoucher(plan, demo)} onOpen={() => openPlan(trip, plan)} />
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
        setDemoState({ tripId: trip.id, voucherTarget: undefined, draft: undefined, voucherOwner: owner })
        go(owner ? 'voucher-import' : 'add-voucher')
      }} />}

      <TabBar active="vouchers" go={go} />
      {toast}
    </Screen>
  )
}

function PlanRow({ trip, plan, missing, onOpen }: { trip: Trip; plan: Plan; missing: boolean; onOpen: () => void }) {
  const member = plan.owner ? trip.members.find((m) => m.name === plan.owner) : undefined
  return (
    <li>
      <button type="button" className={styles.row} onClick={onOpen}>
        <span className={styles.time}>{plan.time}</span>
        <PlanIcon kind={plan.icon} agency={plan.source.kind === 'agency' ? plan.source.name : undefined} />
        <span className={styles.rowText}>
          <strong>{plan.title}</strong>
          {missing ? <span className={styles.missing}>바우처 등록 필요</span> : <span>{plan.location ?? (plan.source.kind === 'agency' ? plan.source.name : plan.source.via)}</span>}
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
  onNext: (trip: Trip, owner?: string) => void
}) {
  const [tripId, setTripId] = useState(trips.some((t) => t.id === defaultTrip) ? defaultTrip : trips[0]?.id)
  const trip = trips.find((t) => t.id === tripId) ?? trips[0]
  const companions = trip ? trip.members.filter((m) => !m.me) : []
  const [owner, setOwner] = useState<string>()
  const chosen = companions.find((m) => m.name === owner)
  const ready = !!trip && (kind === 'mine' || !!chosen)
  const title = kind === 'mine' ? '내 일정 추가' : '일행 일정 추가'

  return (
    <>
      <button type="button" className={styles.dim} aria-label="닫기" onClick={onClose} />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={title}>
        <span className={styles.handle} aria-hidden />
        <h2 className={styles.sheetTitle}>{title}</h2>
        <p className={styles.sheetSub}>
          {kind === 'mine' ? '어느 여행에 넣을까요?' : '동행 대신 받은 바우처를 그 사람 몫으로 보관해요. 내 티켓에는 섞이지 않아요.'}
        </p>

        <h3 className={styles.label}>여행</h3>
        <div className={styles.chips}>
          {trips.map((t) => (
            <button key={t.id} type="button" aria-pressed={t.id === trip?.id} onClick={() => { setTripId(t.id); setOwner(undefined) }}>
              {t.name}
            </button>
          ))}
        </div>

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

        <button type="button" className={cn(styles.next, shared.tappable)} disabled={!ready} onClick={() => trip && onNext(trip, kind === 'companion' ? chosen?.name : undefined)}>
          {kind === 'mine' ? '바우처 가져오기' : chosen ? `${chosen.name}님 바우처 가져오기` : '동행을 선택해 주세요'}
        </button>
      </div>
    </>
  )
}
