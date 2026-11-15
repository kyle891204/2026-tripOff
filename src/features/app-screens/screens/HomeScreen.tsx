import { useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'
import Avatar from '../parts/Avatar'
import PlanIcon from '../parts/PlanIcon'
import Screen from '../parts/Screen'
import { IconWallet } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { MEMBERS, ME, TRIPS, isVisible, type Plan, type PlanIcon as Kind, type Trip } from '../mock'
import { setDemoState, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './HomeScreen.module.css'

/** 카드 안에서 이만큼(px) 스크롤할 때마다 티켓이 한 장 넘어감 */
const STEP = 64
/** 여행 카드 가로 간격 (카드 353 + 간격 12) */
const SLIDE = 365

/** 다가오는 일정: Figma 그대로, 스크롤과 무관하게 고정 */
const UPCOMING: Array<{ icon: Kind; title: string; when: string; kind: string }> = [
  { icon: 'plane', title: '인천 → 간사이', when: '6.12 09:10', kind: '항공사' },
  { icon: 'bus', title: '난바행 셔틀', when: '6.12 14:20', kind: '교통' },
  { icon: 'bed', title: '호텔 한큐 리스파이어', when: '6.12 17:00', kind: '체크인' },
]

/**
 * Figma 17:75 「홈」
 * - 여행 카드: 좌우로 넘겨 여러 여행 전환 (아래 점으로도 이동)
 * - 카드 위에서 아래로 스크롤 → 오른쪽 티켓이 한 장씩 넘어가며 그 여행 일정을 훑어봄
 * - 다가오는 일정 목록은 고정
 */
export default function HomeScreen({ go }: ScreenProps) {
  const { saved } = useDemoState()
  const [toast, showToast] = useToast()
  const [slide, setSlide] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const openTrip = (trip: Trip, day = 0) => {
    setDemoState({ tripId: trip.id, dayIndex: day })
    go('timeline')
  }

  const goSlide = (i: number) => trackRef.current?.scrollTo({ left: i * SLIDE, behavior: 'smooth' })

  return (
    <Screen bg="var(--mist)" label="홈">
      <header className={styles.header}>
        <h1 className={styles.title}>내 여행</h1>
        <button type="button" className={shared.tappable} aria-label="내 프로필" onClick={() => showToast('내 프로필 화면은 준비 중이에요')}>
          <Avatar label={ME.label} name={ME.name} tone="coral" size={36} fontSize={17.1} ring={{ width: 2.5, color: '#fff' }} />
        </button>
      </header>

      <div
        ref={trackRef}
        className={styles.track}
        onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / SLIDE))}
        aria-label="예정된 여행"
      >
        {TRIPS.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            plans={trip.plans.filter((p) => isVisible(p, !!saved[trip.id]))}
            onOpen={(day) => openTrip(trip, day)}
            onMembers={() => {
              setDemoState({ tripId: trip.id })
              go('companions')
            }}
          />
        ))}
      </div>

      <div className={styles.dots} role="tablist" aria-label="여행 선택">
        {TRIPS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={i === slide}
            aria-label={`${t.city} 여행`}
            className={cn(styles.dot, i === slide && styles.dotOn)}
            onClick={() => goSlide(i)}
          />
        ))}
      </div>

      <h2 className={styles.section}>다가오는 일정</h2>
      <ul className={styles.list}>
        {UPCOMING.map((item) => (
          <li key={item.title}>
            <button type="button" className={cn(styles.row, shared.tappable)} onClick={() => openTrip(TRIPS[0])}>
              <PlanIcon kind={item.icon} />
              <span className={styles.rowText}>
                <strong>{item.title}</strong>
                <span>{item.when}</span>
              </span>
              <span className={styles.kind}>{item.kind}</span>
            </button>
          </li>
        ))}
      </ul>

      {toast}
    </Screen>
  )
}

/* ------------------------------------------------------------------ */

interface CardProps {
  trip: Trip
  plans: Plan[]
  onOpen: (day: number) => void
  onMembers: () => void
}

/** 여행 카드. 카드 자체가 세로 스크롤 영역이고, 스크롤 양만큼 티켓이 넘어간다 */
function TripCard({ trip, plans, onOpen, onMembers }: CardProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const progress = Math.min(plans.length - 1, Math.max(0, scrollTop / STEP))
  const index = Math.round(progress)
  const teal = trip.tone === 'teal'

  return (
    <div className={cn(styles.slide, teal && styles.slideTeal)}>
      <div className={styles.cardScroll} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
        <div className={styles.cardInner} style={{ height: 228 + (plans.length - 1) * STEP }}>
          {plans.map((p, k) => (
            <span key={p.id} className={styles.snap} style={{ top: k * STEP }} aria-hidden />
          ))}

          <button
            type="button"
            className={cn(styles.card, shared.tappable)}
            onClick={() => onOpen(plans[index].day)}
            aria-label={`${trip.city} 여행 일정 보기`}
          >
            <span className={styles.cardCircle} aria-hidden />

            <span className={styles.stack} aria-hidden>
              {plans.map((p, i) => (
                <TicketCard key={p.id} plan={p} trip={trip} offset={i - progress} index={i} />
              ))}
            </span>

            <span className={styles.wallet}>
              <IconWallet />
            </span>
            <span className={styles.dday}>{trip.dday}</span>
            <span className={styles.city}>{trip.city}</span>
            <span className={styles.period}>{trip.period}</span>
            <span className={styles.count}>
              <span className={styles.scrollCue} aria-hidden>
                ↕
              </span>
              {index + 1} / {plans.length}
            </span>
          </button>
        </div>
      </div>

      {/* 카드 버튼 안에 버튼을 중첩할 수 없어서 형제로 겹쳐 둠 */}
      <button type="button" className={cn(styles.members, shared.tappable)} aria-label={`${trip.city} 여행 함께 가는 사람`} onClick={onMembers}>
        {MEMBERS.map((m) => (
          <Avatar
            key={m.name}
            label={m.label}
            name={m.name}
            tone={m.tone}
            size={28}
            fontSize={13.3}
            ring={{ width: 2.5, color: teal ? 'var(--trip-teal)' : 'var(--deep)' }}
          />
        ))}
      </button>
    </div>
  )
}

/** 티켓 오른쪽 꼬리 색 (여행사 일정은 딥 틸) */
function stubColor(p: Plan) {
  if (p.source.kind === 'agency') return 'var(--deep)'
  if (p.icon === 'ticket') return 'var(--coral)'
  if (p.icon === 'bus' || p.icon === 'bed') return 'var(--sand)'
  return 'var(--teal-mid)'
}

/** 카드 오른쪽 티켓 한 장. offset = (이 티켓 순번 − 진행도). 0 이 맨 앞 */
function TicketCard({ plan, trip, offset, index }: { plan: Plan; trip: Trip; offset: number; index: number }) {
  const day = trip.days[plan.day]
  let style: CSSProperties
  if (offset < 0) {
    // 지나간 티켓: 위로 날아가며 사라짐
    const d = Math.max(offset, -1.2)
    style = {
      transform: `translate(${-d * 14}px, ${d * 120}px) rotate(${d * 14 - 3}deg)`,
      opacity: Math.max(0, 1 + d),
    }
  } else {
    // 대기 중인 티켓: 뒤로 겹쳐 쌓임
    const d = Math.min(offset, 3.5)
    const tilt = index % 2 === 0 ? -3 : 2
    style = {
      transform: `translate(${d * 3}px, ${d * 13}px) scale(${1 - d * 0.06}) rotate(${tilt + d * (index % 2 ? 2 : -1.5)}deg)`,
      opacity: offset > 3.2 ? 0 : 1 - d * 0.12,
    }
  }
  return (
    <span className={styles.ticket} style={{ ...style, zIndex: 100 - index, ['--stub' as string]: stubColor(plan) }}>
      <span className={styles.tWhen}>
        {plan.source.kind === 'agency' && <span className={styles.tAgency}>여행사</span>}
        {trip.month}.{day.date} {plan.time}
      </span>
      <span className={styles.tTitle}>{plan.title}</span>
    </span>
  )
}
