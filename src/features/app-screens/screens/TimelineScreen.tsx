import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import Screen from '../parts/Screen'
import { IconBed, IconBus, IconPlane, IconShip, IconTicketCoral } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { TRIP } from '../mock'
import type { ScreenId, ScreenProps } from '../types'
import styles from './TimelineScreen.module.css'

interface Item {
  time: string
  /** 카드 top (y). 12일은 Figma 좌표 그대로 */
  top: number
  icon: ReactNode
  title: string
  sub: string
  /** 일정 겹침 강조 (coral 테두리) */
  conflict?: boolean
  /** 누르면 이동할 화면 (없으면 안내 토스트) */
  to?: ScreenId
}

interface Day {
  dow: string
  date: number
  items: Item[]
  /** 겹침 경고 (12일만) */
  warn?: { top: number; text: string; detail: string }
  /** 「일정 추가」 줄 위치 */
  addTop: number
}

/** 12일 이외 날짜: 카드 간격 90px 로 단순 배치 */
const stack = (items: Omit<Item, 'top'>[]): Item[] => items.map((it, i) => ({ ...it, top: 228 + i * 90 }))

const DAYS: Day[] = [
  {
    dow: '금',
    date: 12,
    items: [
      { time: '09:10', top: 228, icon: <IconPlane />, title: '인천 → 간사이', sub: '항공사 직접 예약' },
      { time: '14:00', top: 318, icon: <IconTicketCoral />, title: '유니버설 스튜디오 재팬', sub: 'Klook · QR 3매', conflict: true, to: 'trip-home' },
      { time: '14:20', top: 470, icon: <IconBus tone="coral" />, title: '난바행 셔틀', sub: '교통 예약처', conflict: true },
      { time: '18:30', top: 560, icon: <IconShip />, title: '도톤보리 리버 크루즈', sub: 'KKday · QR 3매', to: 'ticket' },
    ],
    warn: { top: 418, text: '관람 중 셔틀 출발', detail: 'USJ 입장(14:00) 20분 뒤에 셔틀이 출발해요' },
    addTop: 664,
  },
  {
    dow: '토',
    date: 13,
    items: stack([
      { time: '09:30', icon: <IconBus />, title: '교토행 셔틀', sub: '교통 예약처' },
      { time: '13:00', icon: <IconShip />, title: '호즈강 뱃놀이', sub: 'KKday · QR 3매', to: 'ticket' },
      { time: '20:00', icon: <IconBed />, title: '호텔 한큐 리스파이어', sub: '연박 · 2일차' },
    ]),
    addTop: 228 + 3 * 90 + 14,
  },
  {
    dow: '일',
    date: 14,
    items: stack([
      { time: '11:00', icon: <IconShip />, title: '가이유칸 수족관', sub: 'Klook · QR 3매', to: 'ticket' },
      { time: '20:00', icon: <IconBed />, title: '호텔 한큐 리스파이어', sub: '연박 · 3일차' },
    ]),
    addTop: 228 + 2 * 90 + 14,
  },
  {
    dow: '월',
    date: 15,
    items: stack([
      { time: '11:00', icon: <IconBed />, title: '호텔 체크아웃', sub: '호텔 한큐 리스파이어' },
      { time: '18:40', icon: <IconPlane />, title: '간사이 → 인천', sub: '항공사 직접 예약' },
    ]),
    addTop: 228 + 2 * 90 + 14,
  },
]

/** Figma 18:232 「타임라인」 — 여러 예약처 바우처가 하루 일정으로 합쳐짐 */
export default function TimelineScreen({ go, toast: initialToast }: ScreenProps) {
  const [dayIndex, setDayIndex] = useState(0)
  const [toast, showToast] = useToast(initialToast)
  const day = DAYS[dayIndex]

  const open = (it: Item) =>
    it.to ? go(it.to) : showToast(`${it.title} 원본 바우처 화면은 디자인 준비 중이에요`)

  return (
    <Screen bg="var(--mist)" label="타임라인">
      <h1 className={styles.title}>{TRIP.city}</h1>

      <div className={styles.days} role="tablist" aria-label="날짜">
        {DAYS.map((d, i) => (
          <button
            key={d.date}
            type="button"
            role="tab"
            aria-selected={i === dayIndex}
            className={cn(styles.day, i === dayIndex && styles.dayActive, shared.tappable)}
            onClick={() => setDayIndex(i)}
          >
            <span className={styles.dow}>{d.dow}</span>
            <span className={styles.date}>{d.date}</span>
          </button>
        ))}
      </div>

      <span className={styles.rail} aria-hidden />

      {/* key 로 날짜가 바뀔 때마다 카드 등장 애니메이션 */}
      <div key={day.date} className={styles.dayBody} role="tabpanel">
        {day.items.map((it) => (
          <div key={it.time + it.title} className={styles.item} style={{ top: it.top }}>
            <span className={styles.time}>{it.time}</span>
            <span className={cn(styles.dot, it.conflict && styles.dotCoral)} aria-hidden />
            <button
              type="button"
              className={cn(styles.card, it.conflict && styles.cardConflict, shared.tappable)}
              onClick={() => open(it)}
            >
              <span className={cn(shared.iconBox, it.conflict && shared.iconBoxCoral)}>{it.icon}</span>
              <span className={styles.text}>
                <strong>{it.title}</strong>
                <span>{it.sub}</span>
              </span>
            </button>
          </div>
        ))}

        {day.warn && (
          <button
            type="button"
            className={cn(styles.warn, shared.tappable)}
            style={{ top: day.warn.top }}
            onClick={() => showToast(day.warn!.detail)}
          >
            <span className={styles.warnIcon} aria-hidden>
              !
            </span>
            {day.warn.text}
          </button>
        )}

        <div className={styles.item} style={{ top: day.addTop }}>
          <span className={cn(styles.time, styles.timeMuted)}>21:00</span>
          <span className={styles.dotGray} aria-hidden />
          <button type="button" className={cn(styles.add, shared.tappable)} onClick={() => go('add-voucher')}>
            일정 추가
          </button>
        </div>
      </div>

      {toast}
    </Screen>
  )
}
