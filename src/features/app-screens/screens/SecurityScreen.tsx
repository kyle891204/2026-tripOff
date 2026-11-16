import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import homeLogo from '@/assets/icons/ic-home-logo.svg'
import { AuthPanel, AuthSheet, BiometricPad, PatternPad, PinPad, ScreenLayer } from '../parts/Auth'
import auth from '../parts/Auth.module.css'
import Screen from '../parts/Screen'
import { useToast } from '../parts/useToast'
import { METHOD_LABEL, NO_SECURITY, needsAuth, securityOf, setDemoState, useDemoState, type LockMethod, type Security } from '../store'
import type { ScreenProps } from '../types'
import { Page } from './ExtraDemoScreens'
import styles from './SecurityScreen.module.css'

const METHODS: { id: LockMethod; desc: string }[] = [
  { id: 'none', desc: '잠금 없이 바로 열어요' },
  { id: 'biometric', desc: 'Face ID · 지문 등 기기 생체 인식으로 열어요' },
  { id: 'pattern', desc: '점 4개 이상을 이어 그려요' },
  { id: 'pin', desc: '숫자 4자리를 입력해요' },
]

/**
 * 마이페이지 → 보안 설정.
 * 잠금 방식(없음·생체 인식·패턴·PIN)과 쓰는 위치(앱 실행 시 · QR 열 때)를 고른다.
 * 이미 잠금이 있으면 바꾸거나 끄기 전에 지금 방식으로 본인 확인.
 */
export default function SecurityScreen({ back }: ScreenProps) {
  const sec = securityOf(useDemoState())
  const [enroll, setEnroll] = useState<Exclude<LockMethod, 'none'>>()
  const [verify, setVerify] = useState<() => void>()
  const [toast, showToast] = useToast()

  /** 잠금이 있으면 먼저 지금 방식으로 확인하고 진행 */
  const withCurrent = (action: () => void) => (sec.method === 'none' ? action() : setVerify(() => action))

  const save = (next: Security, message: string) => {
    setDemoState({ security: next })
    showToast(message)
  }

  const choose = (id: LockMethod) => {
    if (id === 'none') {
      if (sec.method === 'none') return
      withCurrent(() => save(NO_SECURITY, '잠금을 껐어요'))
    } else withCurrent(() => setEnroll(id))
  }

  const toggle = (key: 'onLaunch' | 'onQr') => {
    const next = { ...sec, [key]: !sec[key] }
    const label = key === 'onLaunch' ? '앱 실행 시' : 'QR 열 때'
    // 잠금을 끄는 쪽만 본인 확인
    if (sec[key]) withCurrent(() => save(next, `${label} 잠금을 껐어요`))
    else save(next, `${label} 잠금을 켰어요`)
  }

  return (
    <Page back={back} title="보안 설정" subtitle="티켓 QR과 앱을 생체 인식 · 패턴 · PIN으로 잠가요">
      <h2 className={styles.label}>잠금 방식</h2>
      <div className={styles.card} role="radiogroup" aria-label="잠금 방식">
        {METHODS.map((m) => {
          const on = sec.method === m.id
          return (
            <button key={m.id} type="button" role="radio" aria-checked={on} className={styles.option} onClick={() => choose(m.id)}>
              <MethodIcon id={m.id} />
              <span className={styles.optionText}>
                <strong>{METHOD_LABEL[m.id]}</strong>
                <span>{on && m.id !== 'none' ? '사용 중 · 눌러서 다시 등록' : m.desc}</span>
              </span>
              <span className={cn(styles.radio, on && styles.radioOn)} aria-hidden />
            </button>
          )
        })}
      </div>

      <h2 className={styles.label}>잠금 사용</h2>
      <div className={cn(styles.card, sec.method === 'none' && styles.disabled)}>
        <Toggle label="앱 실행 시" desc="앱을 열 때마다 본인 확인" on={sec.onLaunch} disabled={sec.method === 'none'} onChange={() => toggle('onLaunch')} />
        <Toggle label="QR 열 때" desc="티켓 QR을 보기 전에 본인 확인 (1분 동안 유지)" on={sec.onQr} disabled={sec.method === 'none'} onChange={() => toggle('onQr')} />
      </div>
      {sec.method === 'none' && <p className={styles.notice}>잠금 방식을 먼저 골라 주세요.</p>}
      <p className={styles.notice}>시연용이라 PIN · 패턴은 이 브라우저에만 저장돼요.</p>

      {verify && (
        <AuthSheet title="본인 확인" desc={`지금 쓰는 ${METHOD_LABEL[sec.method]}으로 확인해 주세요`} onClose={() => setVerify(undefined)} onSuccess={() => { const run = verify; setVerify(undefined); run() }} />
      )}
      {enroll && (
        <EnrollSheet
          method={enroll}
          onClose={() => setEnroll(undefined)}
          onDone={(secret) => {
            setEnroll(undefined)
            // 처음 켤 때 기본: QR 열 때만 잠금
            const first = sec.method === 'none'
            save({ ...sec, method: enroll, pin: undefined, pattern: undefined, credentialId: undefined, ...secret, onQr: first ? true : sec.onQr, onLaunch: first ? false : sec.onLaunch }, `${METHOD_LABEL[enroll]} 잠금을 설정했어요`)
          }}
        />
      )}
      {toast}
    </Page>
  )
}

function Toggle({ label, desc, on, disabled, onChange }: { label: string; desc: string; on: boolean; disabled: boolean; onChange: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on && !disabled} disabled={disabled} className={styles.toggleRow} onClick={onChange}>
      <span className={styles.optionText}>
        <strong>{label}</strong>
        <span>{desc}</span>
      </span>
      <span className={cn(styles.switch, on && !disabled && styles.switchOn)} aria-hidden />
    </button>
  )
}

function MethodIcon({ id }: { id: LockMethod }) {
  const d = {
    none: 'M8.5 10.5V8a3.5 3.5 0 0 1 6.8-1.2M5 10.5h14v10H5z',
    biometric: 'M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 9v1.5M15 9v1.5M12 9v4h-1M9 15.5a4.5 4.5 0 0 0 6 0',
    pattern: 'M6 6h.01M12 6h.01M18 6h.01M6 12h.01M12 12h.01M18 12h.01M6 18h.01M12 18h.01M18 18h.01M6 6l6 6 6-6M12 12v6',
    pin: 'M4 7h16v10H4zM8 12h.01M12 12h.01M16 12h.01',
  }[id]
  return (
    <span className={styles.icon} aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={id === 'pattern' || id === 'pin' ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
    </span>
  )
}

/** 새 잠금 등록: PIN·패턴은 두 번 입력해 확인, 생체 인식은 기기에 등록 */
function EnrollSheet({ method, onDone, onClose }: {
  method: Exclude<LockMethod, 'none'>
  onDone: (secret: Partial<Security>) => void
  onClose: () => void
}) {
  const [first, setFirst] = useState<string>()
  const [error, setError] = useState('')

  const enter = (value: string) => {
    if (method === 'pattern' && value.length < 4) return setError('점 4개 이상을 이어 주세요.')
    if (!first) { setFirst(value); setError(''); return }
    if (value !== first) { setFirst(undefined); setError('처음과 달라요. 처음부터 다시 입력해 주세요.'); return }
    onDone(method === 'pin' ? { pin: value } : { pattern: value })
  }

  const title = method === 'biometric' ? '생체 인식 등록' : first ? '한 번 더 입력해 주세요' : `새 ${METHOD_LABEL[method]} ${method === 'pin' ? '4자리' : '그리기'}`
  return (
    <ScreenLayer>
      <button type="button" className={auth.dim} aria-label="닫기" onClick={onClose} />
      <div className={auth.sheet} role="dialog" aria-modal="true" aria-label={title}>
        <span className={auth.handle} aria-hidden />
        <h2 className={auth.title}>{title}</h2>
        <p className={auth.desc}>{method === 'biometric' ? '이 기기의 Face ID · 지문으로 잠금을 풀어요' : first ? '확인을 위해 같은 값을 다시 입력해요' : '잠금을 풀 때 쓸 값을 정해요'}</p>
        <div className={auth.panel}>
          {method === 'pin' && <PinPad key={first ?? 'first'} onComplete={enter} />}
          {method === 'pattern' && <PatternPad key={first ?? 'first'} onComplete={enter} />}
          {method === 'biometric' && <BiometricPad mode="enroll" onComplete={(credentialId) => onDone({ credentialId })} />}
          <p className={auth.error} role="alert">{error}</p>
        </div>
        <button type="button" className={auth.cancel} onClick={onClose}>취소</button>
      </div>
    </ScreenLayer>
  )
}

/** 앱 실행 시 잠금 — 스플래시 다음 화면 */
export function AppLockScreen({ go }: ScreenProps) {
  const demo = useDemoState()
  const required = needsAuth('launch', demo)
  useEffect(() => { if (!required) go('home', { replace: true }) }, [required, go])
  return (
    <Screen bg="var(--mist)" label="앱 잠금">
      <div className={styles.lock}>
        <img src={homeLogo} alt="" width={44} height={44} />
        <h1>TripOff 잠금 해제</h1>
        <p>{METHOD_LABEL[securityOf(demo).method]}으로 본인 확인을 해 주세요</p>
        {required && <AuthPanel security={securityOf(demo)} onSuccess={() => go('home', { replace: true })} />}
      </div>
    </Screen>
  )
}
