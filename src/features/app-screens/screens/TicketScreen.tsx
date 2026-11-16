import { useState } from 'react'
import { cn } from '@/lib/cn'
import QrCode from '../parts/QrCode'
import { SecureQr } from '../parts/Auth'
import Screen from '../parts/Screen'
import { IconClose, IconSun } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { ME, NEXT_ENTRY, voucherOf } from '../mock'
import { useCurrentPlan, useCurrentTrip, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './TicketScreen.module.css'


/**
 * Figma 18:367 「티켓 (오프라인)」 — 현장에서 보여줄 QR 전체화면.
 * 내 티켓 1매만 보인다 (동행 티켓은 각자 앱에). Figma 의 페이지 점(3장)은 이 원칙에 맞춰 안내 문구로 바꿈.
 */
export default function TicketScreen({ go, back }: ScreenProps) {
  const trip = useCurrentTrip()
  const plan = useCurrentPlan()
  const v = plan ? voucherOf(plan, trip) : undefined
  const entry = v
    ? { title: v.title, time: v.time, code: v.code, gate: plan?.location, qrValue: v.qrValue }
    : NEXT_ENTRY
  const INFO = [
    { label: '입장', value: entry.time },
    { label: '예약번호', value: entry.code },
    ...(entry.gate ? [{ label: v ? '장소' : '게이트', value: entry.gate }] : []),
  ]
  // 이 여행이 「동행 티켓 함께 보기」면 수락한 동행 티켓까지 넘겨 볼 수 있음
  const shareOn = !!useDemoState().shareTickets[trip.id]
  const holders = shareOn ? trip.members.filter((m) => !m.pending) : trip.members.filter((m) => m.me)
  const [page, setPage] = useState(0)
  const holder = holders[Math.min(page, holders.length - 1)] ?? { name: ME.name }
  const [bright, setBright] = useState(false)

  return (
    <Screen bg="#fff" offline label="티켓">
      {/* 밝기 최대: 화면 전체가 살짝 밝아지는 효과 */}
      {bright && <span className={styles.glow} aria-hidden />}

      <button type="button" className={cn(styles.close, shared.tappable)} aria-label="닫기" onClick={back}>
        <IconClose />
      </button>

      <h1 className={styles.title}>{entry.title}</h1>
      <p className={styles.holder}>
        {holder.name} · 성인 1매
      </p>

      <div className={styles.qrBox}>
        <SecureQr size={261}>
          <QrCode key={page} value={page ? `${entry.qrValue}-DEMO-${page}` : entry.qrValue} size={261} />
        </SecureQr>
      </div>

      {holders.length > 1 ? (
        <div className={styles.dots} role="tablist" aria-label="동행 티켓">
          {holders.map((h, i) => (
            <button
              key={h.name}
              type="button"
              role="tab"
              aria-selected={i === page}
              aria-label={h.name}
              className={cn(styles.dot, i === page && styles.dotOn)}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      ) : (
        <p className={styles.mine}>내 티켓만 보여요 · 동행 티켓 함께 보기는 동행 화면에서 설정</p>
      )}

      <dl className={styles.info}>
        {INFO.map((i) => (
          <div key={i.label}>
            <dt>{i.label}</dt>
            <dd>{i.value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.actions}>
        <button
          type="button"
          className={cn(styles.bright, bright && styles.brightOn)}
          aria-pressed={bright}
          onClick={() => setBright((b) => !b)}
        >
          <IconSun />
          밝기 최대
        </button>
        <span className={styles.sep} aria-hidden />
        <button
          type="button"
          className={styles.origin}
          onClick={() => go('voucher-original')}
        >
          원본 보기
        </button>
      </div>

    </Screen>
  )
}
