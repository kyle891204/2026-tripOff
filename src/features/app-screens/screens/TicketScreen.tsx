import { useRef, useState, type PointerEvent } from 'react'
import { cn } from '@/lib/cn'
import QrCode from '../parts/QrCode'
import Screen from '../parts/Screen'
import { IconClose, IconSun } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { MEMBERS, VOUCHER } from '../mock'
import type { ScreenProps } from '../types'
import styles from './TicketScreen.module.css'

/** QR 3매 = 동행 3명 각자의 입장권 */
const PASSES = MEMBERS.map((m, i) => ({ holder: m.name, qr: `${VOUCHER.qrValue}-${i + 1}` }))

const INFO = [
  { label: '입장', value: VOUCHER.time },
  { label: '예약번호', value: 'DEMO-0612' },
  { label: '게이트', value: '메인' },
]

/** 이 거리(px) 이상 가로로 끌면 다음/이전 장 */
const SWIPE_PX = 40

/** Figma 18:367 「티켓 (오프라인)」 — 현장에서 보여줄 QR 전체화면 */
export default function TicketScreen({ back }: ScreenProps) {
  const [page, setPage] = useState(0)
  const [bright, setBright] = useState(false)
  const [toast, showToast] = useToast()
  const startX = useRef<number | null>(null)

  const move = (delta: number) => setPage((p) => Math.min(PASSES.length - 1, Math.max(0, p + delta)))

  const onPointerDown = (e: PointerEvent) => {
    startX.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent) => {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (Math.abs(dx) >= SWIPE_PX) move(dx < 0 ? 1 : -1)
  }

  const pass = PASSES[page]

  return (
    <Screen bg="#fff" offline label="티켓">
      {/* 밝기 최대: 화면 전체가 살짝 밝아지는 효과 */}
      {bright && <span className={styles.glow} aria-hidden />}

      <button type="button" className={cn(styles.close, shared.tappable)} aria-label="닫기" onClick={back}>
        <IconClose />
      </button>

      <h1 className={styles.title}>{VOUCHER.title}</h1>
      <p className={styles.holder}>{pass.holder} · 성인</p>

      <div
        className={styles.qrBox}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (startX.current = null)}
        aria-label={`${pass.holder} 입장 QR, ${page + 1} / ${PASSES.length}. 좌우로 밀어서 넘기기`}
      >
        <span key={page} className={styles.qrInner}>
          <QrCode value={pass.qr} size={261} />
        </span>
      </div>

      <div className={styles.dots} role="tablist" aria-label="입장권">
        {PASSES.map((p, i) => (
          <button
            key={p.holder}
            type="button"
            role="tab"
            aria-selected={i === page}
            aria-label={p.holder}
            className={cn(styles.dot, i === page && styles.dotOn)}
            onClick={() => setPage(i)}
          />
        ))}
      </div>

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
          onClick={() => showToast('원본 바우처(PDF) 화면은 디자인 준비 중이에요')}
        >
          원본 보기
        </button>
      </div>

      {toast}
    </Screen>
  )
}
