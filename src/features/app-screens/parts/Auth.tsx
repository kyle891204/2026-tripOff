/**
 * 보안 잠금 — PIN · 패턴 · 생체 인식 입력판과, 이를 쓰는 잠금 해제 시트 · QR 가림막.
 * 생체 인식은 기기(Face ID · 지문 · Windows Hello)를 쓰고, 기기에 없으면 시연용 인식으로 대신한다.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { METHOD_LABEL, needsAuth, securityOf, useDemoState, type Security } from '../store'
import { biometricAvailable, enrollBiometric, verifyBiometric } from './biometric'
import styles from './Auth.module.css'


/* ------------------------------------------------------------------ */
/* 앱 화면(393×852) 위에 띄우기 — 스크롤 영역 안에서 호출해도 화면 전체를 덮도록 */

export function ScreenLayer({ children }: { children: ReactNode }) {
  const anchor = useRef<HTMLSpanElement>(null)
  const [root, setRoot] = useState<Element | null>(null)
  useEffect(() => { setRoot(anchor.current?.closest('[data-app-screen]') ?? null) }, [])
  return <><span ref={anchor} hidden />{root && createPortal(children, root)}</>
}

/* ------------------------------------------------------------------ */
/* PIN */

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

export function PinPad({ onComplete }: { onComplete: (pin: string) => void }) {
  const [value, setValue] = useState('')
  const press = (k: string) => {
    if (k === '⌫') return setValue((v) => v.slice(0, -1))
    if (!k) return
    const next = value + k
    if (next.length < 4) return setValue(next)
    setValue('')
    onComplete(next)
  }
  return (
    <div className={styles.pin}>
      <div className={styles.dots} aria-label={`${value.length}자리 입력됨`}>
        {[0, 1, 2, 3].map((i) => <span key={i} className={cn(i < value.length && styles.dotOn)} />)}
      </div>
      <div className={styles.keys}>
        {KEYS.map((k, i) => k ? (
          <button key={i} type="button" onClick={() => press(k)} aria-label={k === '⌫' ? '지우기' : k}>{k}</button>
        ) : <span key={i} />)}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 패턴 (3×3) */

const GRID = 216
const STEP = GRID / 3
const center = (i: number) => ({ x: (i % 3) * STEP + STEP / 2, y: Math.floor(i / 3) * STEP + STEP / 2 })

export function PatternPad({ onComplete }: { onComplete: (seq: string) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const [seq, setSeq] = useState<number[]>([])
  const [pointer, setPointer] = useState<{ x: number; y: number }>()
  const drawing = useRef(false)

  /** 화면이 축소 표시되므로 화면 좌표 → 패드 좌표로 환산 */
  const local = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    const k = r.width / GRID
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }
  }
  const hit = (p: { x: number; y: number }) => {
    for (let i = 0; i < 9; i++) {
      const c = center(i)
      if (Math.hypot(c.x - p.x, c.y - p.y) < 24) return i
    }
    return -1
  }
  const add = (p: { x: number; y: number }) => {
    const i = hit(p)
    if (i >= 0) setSeq((s) => (s.includes(i) ? s : [...s, i]))
  }
  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    setPointer(undefined)
    setSeq((s) => {
      if (s.length) onComplete(s.join(''))
      return []
    })
  }

  const points = seq.map(center)
  return (
    <div
      ref={box}
      className={styles.pattern}
      style={{ width: GRID, height: GRID }}
      role="group"
      aria-label="패턴 입력: 점 4개 이상을 이어 그려 주세요"
      onPointerDown={(e) => {
        drawing.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        const p = local(e)
        setPointer(p)
        add(p)
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return
        const p = local(e)
        setPointer(p)
        add(p)
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <svg width={GRID} height={GRID} aria-hidden>
        {points.length > 0 && (
          <polyline
            points={[...points, ...(pointer ? [pointer] : [])].map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="var(--teal)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {Array.from({ length: 9 }, (_, i) => {
          const c = center(i)
          const on = seq.includes(i)
          return <circle key={i} cx={c.x} cy={c.y} r={on ? 10 : 7} fill={on ? 'var(--teal)' : '#c5d4d2'} />
        })}
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 생체 인식 (기기 Face ID · 지문 등) */

/**
 * enroll: 이 기기 생체 인식 등록 → credential id 를 넘김 (기기에 없으면 undefined = 시연용)
 * verify: credentialId 가 있으면 기기로 확인, 없으면(시연용 등록) 눌러서 인식
 */
export function BiometricPad({ mode, credentialId, onComplete }: {
  mode: 'enroll' | 'verify'
  credentialId?: string
  onComplete: (credentialId?: string) => void
}) {
  const [available, setAvailable] = useState<boolean>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { void biometricAvailable().then(setAvailable) }, [])

  const useDevice = mode === 'enroll' ? !!available : !!credentialId
  const start = async () => {
    setBusy(true)
    setError('')
    try {
      if (!useDevice) {
        await new Promise((r) => window.setTimeout(r, 650))
        onComplete(undefined)
      } else if (mode === 'enroll') onComplete(await enrollBiometric())
      else { await verifyBiometric(credentialId!); onComplete(credentialId) }
    } catch {
      setError('인증이 취소됐거나 실패했어요. 다시 눌러 주세요.')
    } finally {
      setBusy(false)
    }
  }

  const hint = busy
    ? useDevice ? '기기 화면의 안내를 따라 주세요' : '인식하는 중…'
    : useDevice ? 'Face ID · 지문 등 이 기기의 생체 인식을 써요' : available === false && mode === 'enroll' ? '이 기기는 생체 인식을 쓸 수 없어 시연용으로 인식해요' : '눌러서 인식 (시연용)'
  return (
    <div className={styles.finger}>
      <button type="button" className={cn(styles.sensor, busy && styles.scanning)} onClick={() => void start()} disabled={busy || available === undefined} aria-label={mode === 'enroll' ? '생체 인식 등록' : '생체 인식으로 확인'}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 9v1.5M15 9v1.5M12 9v4h-1M9 15.5a4.5 4.5 0 0 0 6 0" />
        </svg>
      </button>
      <p className={styles.hint}>{hint}</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 저장된 방식으로 본인 확인 */

export function AuthPanel({ security, onSuccess }: { security: Security; onSuccess: () => void }) {
  const [error, setError] = useState('')
  const check = (ok: boolean, what: string) => (ok ? onSuccess() : setError(`${what}이 맞지 않아요. 다시 시도해 주세요.`))
  return (
    <div className={styles.panel}>
      {security.method === 'pin' && <PinPad onComplete={(v) => check(v === security.pin, 'PIN')} />}
      {security.method === 'pattern' && <PatternPad onComplete={(v) => check(v === security.pattern, '패턴')} />}
      {security.method === 'biometric' && <BiometricPad mode="verify" credentialId={security.credentialId} onComplete={onSuccess} />}
      <p className={styles.error} role="alert">{error}</p>
    </div>
  )
}

export function AuthSheet({ title, desc, security, onSuccess, onClose }: {
  title: string
  desc?: string
  security?: Security
  onSuccess: () => void
  onClose: () => void
}) {
  const current = securityOf(useDemoState())
  return (
    <ScreenLayer>
      <button type="button" className={styles.dim} aria-label="닫기" onClick={onClose} />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label={title}>
        <span className={styles.handle} aria-hidden />
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.desc}>{desc ?? `${METHOD_LABEL[(security ?? current).method]}으로 본인 확인을 해 주세요`}</p>
        <AuthPanel security={security ?? current} onSuccess={onSuccess} />
        <button type="button" className={styles.cancel} onClick={onClose}>취소</button>
      </div>
    </ScreenLayer>
  )
}

/* ------------------------------------------------------------------ */
/* QR 가림막 — 「QR 열 때」 잠금이 켜져 있으면 본인 확인 후 보여 줌 */

/** 한 번 풀면 잠시 동안은 다시 묻지 않음 (여행 중 홈 → 티켓처럼 이어서 열 때) */
const UNLOCK_MS = 60_000
let unlockedAt = 0

export function SecureQr({ size, children, passive }: {
  size: number
  children: ReactNode
  /** 부모가 이미 버튼이면(눌러서 티켓 열기 등) 가림막만 보이고 확인은 다음 화면에서 */
  passive?: boolean
}) {
  const demo = useDemoState()
  const [open, setOpen] = useState(() => !needsAuth('qr', demo) || Date.now() - unlockedAt < UNLOCK_MS)
  const [asking, setAsking] = useState(false)
  if (open || !needsAuth('qr', demo)) return <>{children}</>

  const small = size < 120
  const cover = (
    <>
      <svg width={small ? 18 : 28} height={small ? 18 : 28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
        <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
      </svg>
      {!small && <strong>QR 보기</strong>}
      {!small && <span>{METHOD_LABEL[securityOf(demo).method]}으로 잠금 해제</span>}
    </>
  )
  return (
    <>
      {passive ? (
        <span className={cn(styles.cover, small && styles.coverSmall)} style={{ width: size, height: size }} aria-label="잠긴 QR">{cover}</span>
      ) : (
        <button type="button" className={cn(styles.cover, small && styles.coverSmall)} style={{ width: size, height: size }} onClick={() => setAsking(true)} aria-label="잠긴 QR, 눌러서 본인 확인">{cover}</button>
      )}
      {asking && (
        <AuthSheet
          title="QR 열기"
          onClose={() => setAsking(false)}
          onSuccess={() => { unlockedAt = Date.now(); setAsking(false); setOpen(true) }}
        />
      )}
    </>
  )
}
