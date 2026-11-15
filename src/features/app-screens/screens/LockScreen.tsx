import { useState } from 'react'
import { cn } from '@/lib/cn'
import QrCode from '../parts/QrCode'
import Screen from '../parts/Screen'
import { IconAppLogo, IconCamera, IconFlash } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { NEXT_ENTRY } from '../mock'
import type { ScreenProps } from '../types'
import styles from './LockScreen.module.css'

/** Figma 18:458 「잠금 화면 (프리미엄)」 — 잠금화면 위젯에서 바로 QR */
export default function LockScreen({ go }: ScreenProps) {
  const [flash, setFlash] = useState(false)
  const [toast, showToast] = useToast()

  return (
    <Screen bg="var(--deep)" dark label="잠금 화면">
      <span className={styles.blobA} aria-hidden />
      <span className={styles.blobB} aria-hidden />

      <p className={styles.date}>6월 12일 금요일</p>
      <p className={styles.clock}>13:30</p>

      <button type="button" className={cn(styles.widget, shared.tappable)} onClick={() => go('ticket')}>
        <span className={styles.logo}>
          <IconAppLogo />
        </span>
        <span className={styles.name}>USJ 입장</span>
        <span className={styles.eta}>30분 후</span>
        <span className={styles.time}>{NEXT_ENTRY.time}</span>
        <span className={styles.gate}>메인 게이트 · 성인 1매</span>
        <span className={styles.progress} aria-hidden>
          <span />
        </span>
        <span className={styles.qr}>
          <QrCode value={NEXT_ENTRY.qrValue} size={76} />
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
