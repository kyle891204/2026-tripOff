import { useState, type ReactNode } from 'react'
import { tapThen } from './tap'
import { cn } from '@/lib/cn'
import { FLOW, OUTRO_OFFSET, PARTNER_OFFSET, PART_LABEL } from './demoFlow'
import s from './FlowPanel.module.css'

const GROUPS = [
  { label: '고객 앱', from: 0, to: PARTNER_OFFSET },
  { label: '파트너센터', from: PARTNER_OFFSET, to: OUTRO_OFFSET },
  { label: '마무리 · 고객 앱', from: OUTRO_OFFSET, to: FLOW.length },
]

/**
 * 시연 컨트롤러. /demo 오른쪽과 파트너센터 오른쪽에 같은 모양으로 뜬다.
 * 「다음」 버튼은 단계가 바뀌어도 같은 자리에 있어서 계속 눌러 넘길 수 있다.
 */
export default function FlowPanel({ index, started = index >= 0, onSelect, onStart, onRestart, now, action, children }: {
  /** 현재 단계 (시작 화면이면 -1) */
  index: number
  /** 시연을 시작했는지 (시작 전에는 「시작하기」 버튼만) */
  started?: boolean
  onSelect: (index: number) => void
  onStart?: () => void
  /** 마지막 단계에서 「처음으로」 */
  onRestart?: () => void
  /** 지금 폰에 떠 있는 화면 이름 */
  now?: string
  /** 화면이 다음 버튼을 빌려 쓸 때 (예: 상품 등록 예시 채우기). 다 끝나면 화면이 내려놓는다. */
  action?: { label: string; hint?: string; tap?: string; run: () => void } | null
  /** 시연 옵션 (접어 두는 영역) */
  children?: ReactNode
}) {
  const step = index >= 0 ? FLOW[index] : undefined
  // 터치 모션이 도는 동안 다음 버튼을 잠깐 막아 두 번 눌리지 않게
  const [busy, setBusy] = useState(false)
  const runAction = () => {
    if (!action || busy) return
    setBusy(true)
    tapThen(action.tap, () => { action.run(); window.setTimeout(() => setBusy(false), 120) })
  }
  const last = index >= FLOW.length - 1
  const next = FLOW[index + 1]
  // 고객 앱 ↔ 파트너센터를 넘나들 때는 어디로 가는지 버튼에 적는다
  const nextLabel = last ? (onRestart ? '처음으로 ↻' : '마지막 단계예요')
    : step && next && next.part !== step.part ? (next.part === 'partner' ? '파트너센터로 →' : '고객 앱으로 →') : '다음 →'

  return (
    <section className={s.panel} aria-label="시연 진행">
      <p className={s.eyebrow}>
        {step ? <>{PART_LABEL[step.part]} · <b>{index + 1}</b> / {FLOW.length}</> : started ? '시작 · 앱 열기' : '트립오프 시연'}
      </p>

      <div className={s.hero} key={`${started}-${index}`} aria-live="polite">
        <h2>{step?.title ?? (started ? '트립오프를 열었어요' : '예약부터 파트너센터까지')}</h2>
        <p>{step?.desc ?? (started ? '스플래시를 지나 내 여행 홈이 열려요. 「다음」을 누르면 여행 만들기부터 시작해요.' : '고객 앱 5단계와 파트너센터 6단계를 「다음」 하나로 이어서 보여 드려요.')}</p>
        {action?.hint && <span className={s.hint}>{action.hint}</span>}
      </div>

      {started ? (
        <div className={s.nav}>
          <button type="button" disabled={index <= 0} onClick={() => onSelect(index - 1)}>← 이전</button>
          {action
            ? <button type="button" className={s.primary} aria-busy={busy} onClick={runAction}>{action.label}</button>
            : <button type="button" className={s.primary} disabled={last && !onRestart} onClick={() => (last ? onRestart?.() : onSelect(index + 1))}>{nextLabel}</button>}
        </div>
      ) : (
        <button type="button" className={s.start} onClick={onStart}>시작하기</button>
      )}

      <div className={s.bar} aria-hidden="true"><span style={{ width: `${((index + 1) / FLOW.length) * 100}%` }} /></div>

      {GROUPS.map(group => (
        <div key={group.label} className={s.group}>
          <p className={s.groupLabel}>{group.label}</p>
          <ol className={s.list} start={group.from + 1}>
            {FLOW.slice(group.from, group.to).map((item, offset) => {
              const i = group.from + offset
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    className={cn(s.item, i === index && s.active, started && i < index && s.done)}
                    aria-current={i === index ? 'step' : undefined}
                    onClick={() => onSelect(i)}
                  >
                    <span className={s.num}>{started && i < index ? '✓' : i + 1}</span>
                    {item.title}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      ))}

      {now && <p className={s.now}>지금 화면 · {now}</p>}
      {children && <details className={s.options}><summary>시연 옵션</summary><div>{children}</div></details>}
    </section>
  )
}
