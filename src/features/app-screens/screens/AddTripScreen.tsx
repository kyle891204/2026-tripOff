import { useState } from 'react'
import { cn } from '@/lib/cn'
import Screen from '../parts/Screen'
import { IconBack, IconChevronRight } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { makeTrip } from '../mock'
import { getDemoState, setDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './AddTripScreen.module.css'

const SUGGESTIONS = ['도쿄', '다낭', '방콕', '타이베이', '파리']

/**
 * ⚠ 임시 화면 — Figma 에 없음.
 * 새 여행 만들기: 어디로 + 언제. 만들면 빈 여행 타임라인으로 들어가 바우처를 추가한다.
 * 여행사 패키지는 여행사가 보낸 초대 링크로 자동 추가되는 흐름이라 별도 안내만.
 */
export default function AddTripScreen({ go, back }: ScreenProps) {
  const [city, setCity] = useState('')
  const [start, setStart] = useState('2026-07-17')
  const [end, setEnd] = useState('2026-07-20')

  const name = city.trim()
  const valid = name.length > 0 && !!start && !!end && end >= start

  const create = () => {
    if (!valid) return
    const state = getDemoState()
    const trip = makeTrip(name, start, end, state.customTrips.length + 2)
    setDemoState({ customTrips: [...state.customTrips, trip], tripId: trip.id, dayIndex: 0 })
    go('timeline', { toast: `${name} 여행을 만들었어요. 바우처를 추가해 보세요`, replace: true })
  }

  return (
    <Screen bg="#fff" label="새 여행">
      <button type="button" className={shared.back} aria-label="뒤로" onClick={back}>
        <IconBack />
      </button>

      <h1 className={styles.title}>새 여행</h1>

      <label className={styles.label} htmlFor="trip-city">
        어디로 가세요?
      </label>
      <input
        id="trip-city"
        className={styles.input}
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="도시 이름"
        maxLength={12}
        autoComplete="off"
      />
      <div className={styles.chips}>
        {SUGGESTIONS.map((c) => (
          <button
            key={c}
            type="button"
            className={cn(styles.chip, name === c && styles.chipOn, shared.tappable)}
            onClick={() => setCity(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <p className={cn(styles.label, styles.labelDates)}>언제 가세요?</p>
      <div className={styles.dates}>
        <label className={styles.date}>
          <span>가는 날</span>
          <input type="date" value={start} min="2026-06-07" onChange={(e) => setStart(e.target.value)} />
        </label>
        <span className={styles.tilde} aria-hidden>
          ~
        </span>
        <label className={styles.date}>
          <span>오는 날</span>
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>
      {end < start && <p className={styles.error}>오는 날이 가는 날보다 빨라요</p>}

      <p className={styles.note}>함께 가는 사람은 여행을 만든 뒤 초대할 수 있어요</p>

      <button
        type="button"
        className={cn(styles.agency, shared.tappable)}
        onClick={() => go('agency-join')}
      >
        <span>
          <strong>여행사 패키지로 가시나요?</strong>
          <span>여행사 초대 코드로 참여하기</span>
        </span>
        <IconChevronRight />
      </button>

      <button
        type="button"
        className={cn(shared.cta, shared.ctaInk, styles.create, shared.tappable)}
        disabled={!valid}
        onClick={create}
      >
        여행 만들기
      </button>

    </Screen>
  )
}
