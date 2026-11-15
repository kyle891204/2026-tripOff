import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import Avatar from '../parts/Avatar'
import Screen from '../parts/Screen'
import { IconBed, IconBus, IconPlane, IconPlus, IconWallet } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { MEMBERS, TRIP } from '../mock'
import type { ScreenProps } from '../types'
import styles from './HomeScreen.module.css'

const UPCOMING = [
  { icon: <IconPlane />, title: '인천 → 간사이', when: '6.12 09:10', kind: '항공사' },
  { icon: <IconBus />, title: '난바행 셔틀', when: '6.12 14:20', kind: '교통' },
  { icon: <IconBed />, title: '호텔 한큐 리스파이어', when: '6.12 17:00', kind: '체크인' },
]

/** 뒤에 쌓인 티켓 장수 (앞 장 포함 4장으로 "여러 장" 표현) */
const STACK = ['sand', 'teal', 'coral'] as const

interface Props extends ScreenProps {
  /** 바텀시트 등 위에 덮을 레이어 */
  overlay?: ReactNode
}

/** Figma 17:75 「홈」 */
export default function HomeScreen({ go, overlay }: Props) {
  return (
    <Screen bg="var(--mist)" label="홈">
      <div className={styles.body}>
        <header className={styles.header}>
          <h1 className={styles.title}>내 여행</h1>
          <button type="button" className={shared.tappable} aria-label="함께 가는 사람" onClick={() => go('companions')}>
            <Avatar label="용" name="김용태" tone="coral" size={36} fontSize={17.1} ring={{ width: 2.5, color: '#fff' }} />
          </button>
        </header>

        <div className={styles.cardWrap}>
        <button type="button" className={cn(styles.card, shared.tappable)} onClick={() => go('timeline')}>
          <span className={styles.cardCircle} aria-hidden />

          {/* 티켓 묶음 (Figma 이후 추가안: 카드 오른쪽에 바우처가 겹쳐 꽂힌 모양) */}
          <span className={styles.stack} aria-hidden>
            {STACK.map((tone, i) => (
              <span key={tone} className={cn(styles.ticket, styles[`t${i}`], styles[tone])} />
            ))}
            <span className={cn(styles.ticket, styles.t3, styles.front)}>
              <span className={styles.dday}>{TRIP.dday}</span>
            </span>
          </span>

          <span className={styles.wallet}>
            <IconWallet />
          </span>
          <span className={styles.city}>{TRIP.city}</span>
          <span className={styles.period}>{TRIP.period}</span>
          <span className={styles.count}>티켓 {TRIP.tickets}</span>
        </button>
        {/* 카드 버튼 안에 버튼을 중첩할 수 없어서 형제로 겹쳐 둠 */}
        <button type="button" className={cn(styles.members, shared.tappable)} aria-label="함께 가는 사람" onClick={() => go('companions')}>
          {MEMBERS.map((m) => (
            <Avatar
              key={m.name}
              label={m.label}
              name={m.name}
              tone={m.tone}
              size={28}
              fontSize={13.3}
              ring={{ width: 2.5, color: 'var(--deep)' }}
            />
          ))}
        </button>
        </div>

        <h2 className={styles.section}>다가오는 일정</h2>
        <ul className={styles.list}>
          {UPCOMING.map((item) => (
            <li key={item.title}>
              <button type="button" className={cn(styles.row, shared.tappable)} onClick={() => go('timeline')}>
                <span className={shared.iconBox}>{item.icon}</span>
                <span className={styles.rowText}>
                  <strong>{item.title}</strong>
                  <span>{item.when}</span>
                </span>
                <span className={styles.kind}>{item.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button type="button" className={cn(styles.fab, shared.tappable)} aria-label="바우처 추가" onClick={() => go('add-voucher')}>
        <IconPlus />
      </button>

      {overlay}
    </Screen>
  )
}
