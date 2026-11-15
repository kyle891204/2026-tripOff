import { useState } from 'react'
import { cn } from '@/lib/cn'
import QrCode from '../parts/QrCode'
import Screen from '../parts/Screen'
import { IconAppLogo, IconCamera, IconFlash } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { voucherOf } from '../mock'
import { nextStoredTicket, setDemoState, useCurrentTrip, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './LockScreen.module.css'

/** Figma 18:458 「잠금 화면 (프리미엄)」 — 잠금화면 위젯에서 바로 QR */
export default function LockScreen({ go }: ScreenProps) {
  const [flash, setFlash] = useState(false)
  const [toast, showToast] = useToast()
  const trip = useCurrentTrip()
  const state = useDemoState()
  const plan = nextStoredTicket(trip, state)
  const voucher = plan && voucherOf(plan, trip)

  return (
    <Screen bg="var(--deep)" dark label="잠금 화면">
      <span className={styles.blobA} aria-hidden />
      <span className={styles.blobB} aria-hidden />

      <p className={styles.date}>{voucher?.date ?? trip.period}</p>
      <p className={styles.clock}>13:30</p>

      <button type="button" className={cn(styles.widget, shared.tappable)} onClick={() => {
          setDemoState({ planId: plan?.id })
          go(plan ? 'ticket' : 'premium')
        }}>
        <span className={styles.logo}>
          <IconAppLogo />
        </span>
        <span className={styles.name}>{voucher?.title ?? '저장된 티켓 없음'}</span>
        <span className={styles.eta}>{voucher ? '저장된 티켓' : '시연용 위젯'}</span>
        <span className={styles.time}>{voucher?.time ?? '—'}</span>
        <span className={styles.gate}>{plan?.location ?? '여행 지갑'} · 시연</span>
        <span className={styles.progress} aria-hidden>
          <span />
        </span>
        <span className={styles.qr}>
          {voucher && <QrCode value={voucher.qrValue} size={76} />}
        </span>
      </button>

      <button
        type="button"
        className={cn(styles.round, styles.left, flash && styles.on, shared.tappable)}
        aria-label="손전등"
        aria-pressed={flash}
        onClick={() => setFlash((f) => !f)}
      >
        <IconFlash />
      </button>
      <button
        type="button"
        className={cn(styles.round, styles.right, shared.tappable)}
        aria-label="카메라"
        onClick={() => showToast('위젯을 누르면 잠금 해제 없이 QR 이 열려요')}
      >
        <IconCamera />
      </button>

      {toast}
    </Screen>
  )
}
