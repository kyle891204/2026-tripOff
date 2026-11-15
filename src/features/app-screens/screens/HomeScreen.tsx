import { useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'
import { useDemoNotifications } from '@/data/demoNotifications'
import Avatar from '../parts/Avatar'
import PlanIcon from '../parts/PlanIcon'
import Screen from '../parts/Screen'
import TabBar from '../parts/TabBar'
import homeLogo from '@/assets/icons/ic-home-logo.svg'
import shared from '../parts/shared.module.css'
import { ME, dateAt, type Plan, type PlanIcon as Kind, type Trip } from '../mock'
import { allTrips, setDemoState, tripPlans, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './HomeScreen.module.css'

/** 카드 안에서 이만큼(px) 스크롤할 때마다 티켓이 한 장 넘어감 */
const STEP = 64
/** 여행 카드 가로 간격 (카드 353 + 간격 12) */
const SLIDE = 365

const KIND_LABEL: Record<Kind, string> = { plane: '항공', bus: '교통', bed: '숙소', ship: '크루즈', ticket: '입장권' }

/**
 * Figma 17:75 「홈」
 * - 여행 카드: 좌우로 넘겨 여러 여행 전환 (아래 점으로도 이동)
 * - 카드 위에서 아래로 스크롤 → 오른쪽 티켓이 한 장씩 넘어가며 그 여행 일정을 훑어봄
 * - 다가오는 일정 목록은 고정
 */
export default function HomeScreen({ go }: ScreenProps) {
  const demo = useDemoState()
  const unread = useDemoNotifications().some(row => !row.read)
  const trips = allTrips(demo)
  const [slide, setSlide] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const upcomingTrip = trips[slide]
  const upcoming = upcomingTrip ? tripPlans(upcomingTrip, demo).slice(0, 3) : []
  const openPlan = (trip: Trip, plan: Plan) => {
    setDemoState({ tripId: trip.id, dayIndex: plan.day, planId: plan.id, voucherTarget: undefined, draft: undefined })
    go('plan')
  }

  const openTrip = (trip: Trip, day = 0) => {
    setDemoState({ tripId: trip.id, dayIndex: day })
    go('timeline')
  }

  const goSlide = (i: number) => trackRef.current?.scrollTo({ left: i * SLIDE, behavior: 'smooth' })

  return (
    <Screen bg="var(--mist)" label="홈">
      <header className={styles.header}>
        <h1 className={styles.title}><img className={styles.homeLogo} src={homeLogo} alt="TripOff" />내 여행</h1>
        <div className={styles.headerActions}>
          <button type="button" className={cn(styles.bell, shared.tappable)} aria-label={unread ? '알림함, 새 알림 있음' : '알림함'} onClick={() => go('notifications')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0" />
            </svg>
            {unread && <span className={styles.notificationDot} aria-hidden />}
          </button>
          <button type="button" className={shared.tappable} aria-label="내 프로필" onClick={() => go('profile')}>
            <Avatar label={ME.label} name={ME.name} tone="coral" size={36} fontSize={17.1} ring={{ width: 2.5, color: '#fff' }} />
          </button>
        </div>
      </header>

      <div
        ref={trackRef}
        className={styles.track}
        onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / SLIDE))}
        aria-label="예정된 여행"
      >
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            plans={tripPlans(trip, demo)}
            onOpen={(day) => openTrip(trip, day)}
            onPlan={(plan) => openPlan(trip, plan)}
            onMembers={() => {
              setDemoState({ tripId: trip.id })
              go('companions')
            }}
          />
        ))}

        {/* 맨 끝: 새 여행 만들기 */}
        <button type="button" className={cn(styles.newTrip, shared.tappable)} onClick={() => go('add-trip')}>
          <span className={styles.newPlus} aria-hidden>
            +
          </span>
          <strong>새 여행</strong>
          <span>여행을 만들고 바우처를 모아 보세요</span>
        </button>
      </div>

      <div className={styles.dots} role="tablist" aria-label="여행 선택">
        {trips.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={i === slide}
            aria-label={t.name}
            className={cn(styles.dot, i === slide && styles.dotOn)}
            onClick={() => goSlide(i)}
          />
        ))}
        <button
          type="button"
          role="tab"
          aria-selected={slide === trips.length}
          aria-label="새 여행 만들기"
          className={cn(styles.dot, styles.dotPlus, slide === trips.length && styles.dotOn)}
          onClick={() => goSlide(trips.length)}
        />
      </div>

      <h2 className={styles.section}>다가오는 일정</h2>
      <ul className={styles.list}>
        {upcoming.map((item) => (
          <li key={item.id}>
            <button type="button" className={cn(styles.row, shared.tappable)} onClick={() => openPlan(upcomingTrip, item)}>
              <PlanIcon kind={item.icon} agency={item.source.kind === 'agency' ? item.source.name : undefined} />
              <span className={styles.rowText}>
                <strong>{item.title}</strong>
                <span>{dateAt(upcomingTrip, item.day).slice(5).replace('-', '.')} {item.time}</span>
              </span>
              <span className={styles.kind}>{KIND_LABEL[item.icon]}</span>
            </button>
          </li>
        ))}
        {upcoming.length === 0 && <li className={styles.emptyUpcoming}>등록된 일정이 없어요. 여행에 바우처를 추가해 보세요.</li>}
      </ul>

      <TabBar active="home" go={go} />
    </Screen>
  )
}

/* ------------------------------------------------------------------ */

interface CardProps {
  trip: Trip
  plans: Plan[]
  onOpen: (day: number) => void
  onPlan: (plan: Plan) => void
  onMembers: () => void
}

/** 여행 카드. 카드 자체가 세로 스크롤 영역이고, 스크롤 양만큼 티켓이 넘어간다 */
function TripCard({ trip, plans, onOpen, onPlan, onMembers }: CardProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const empty = plans.length === 0
  const progress = empty ? 0 : Math.min(plans.length - 1, Math.max(0, scrollTop / STEP))
  const index = Math.round(progress)
  const teal = trip.tone === 'teal'

  return (
    <div className={cn(styles.slide, teal && styles.slideTeal)}>
      <div className={styles.cardScroll} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
        <div className={styles.cardInner} style={{ height: 228 + Math.max(0, plans.length - 1) * STEP }}>
          {plans.map((p, k) => (
            <span key={p.id} className={styles.snap} style={{ top: k * STEP }} aria-hidden />
          ))}

          <div className={styles.card}>
            <button type="button" className={styles.cardAction} onClick={() => onOpen(plans[index]?.day ?? 0)} aria-label={`${trip.name} 일정 보기`} />
            <span className={styles.cardCircle} aria-hidden />

            <span className={styles.stack}>
              {plans.map((p, i) => (
                <TicketCard key={p.id} plan={p} trip={trip} offset={i - progress} index={i} />
              ))}
              {empty && (
                <span className={styles.ticketEmpty}>
                  아직 바우처가 없어요
                  <br />
                  눌러서 추가
                </span>
              )}
              {!empty && <button type="button" className={styles.ticketAction} aria-label={`${plans[index].title} 일정 상세 보기`} onClick={() => onPlan(plans[index])} />}
            </span>
            <span className={styles.dday}>{trip.dday}</span>
            <span data-trip-info className={cn(styles.city, trip.name.length > 5 && styles.cityLong, trip.name.length > 9 && styles.cityXLong)}>{trip.name}</span>
            <span data-trip-info className={styles.period}>{trip.period}</span>
            {!empty && (
              <span className={styles.count}>
                <span className={styles.scrollCue} aria-hidden>
                  ↕
                </span>
                {index + 1} / {plans.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 카드 버튼 안에 버튼을 중첩할 수 없어서 형제로 겹쳐 둠 */}
      <button type="button" className={cn(styles.members, shared.tappable)} aria-label={`${trip.name} 함께 가는 사람`} onClick={onMembers}>
        {trip.members.map((m) => (
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

/** 티켓 오른쪽 꼬리 색 (일정 종류별) */
function stubColor(p: Plan) {
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
    <span aria-hidden className={styles.ticket} style={{ ...style, zIndex: 100 - index, ['--stub' as string]: stubColor(plan) }}>
      <span className={styles.tWhen}>
        {plan.source.kind === 'agency' && <span className={styles.tAgency} aria-label="여행사 일정" />}
        {trip.month}.{day.date} {plan.time}
      </span>
      <span className={styles.tTitle}>{plan.title}</span>
      <span className={styles.ticketIcon} data-kind={plan.icon}><PlanIcon kind={plan.icon} /></span>
    </span>
  )
}

