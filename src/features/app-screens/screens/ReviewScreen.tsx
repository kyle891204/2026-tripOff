import { useState } from 'react'
import { cn } from '@/lib/cn'
import QrCode from '../parts/QrCode'
import Screen from '../parts/Screen'
import { IconArrowRight, IconBack } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { dateAt, voucherOf } from '../mock'
import { addPlan, editPlan, getDemoState, setDemoState, useCurrentPlan, useCurrentTrip, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './ReviewScreen.module.css'

/**
 * Figma 18:167 「추출 결과 확인」 — 추출한 값을 확인하고 고치는 화면.
 * 모드: 새 바우처(샘플, 원본과 다른 입장 시간을 잡아냄) / 일정에 등록 / 바우처 수정
 * 모든 값(제목·날짜·시간·예약번호·인원)은 눌러서 바로 고칠 수 있다.
 */
export default function ReviewScreen({ go, back }: ScreenProps) {
  const trip = useCurrentTrip()
  const plan = useCurrentPlan()
  const { voucherTarget, draft, dayIndex } = useDemoState()
  // 대상 일정이 있으면 그 일정의 바우처를 등록/수정, 없으면 새 바우처(샘플) 추가
  const mode = voucherTarget && plan ? voucherTarget.mode : 'new'
  const isSample = draft?.kind === 'sample' || (mode === 'new' && !draft)
  const base = mode !== 'new' ? { ...voucherOf(plan!, trip), wrongTime: '' } : isSample ? trip.sample : { provider: '직접 등록', title: '', file: draft?.original?.name ?? '예약정보 직접 입력', wrongTime: '', time: '09:00', code: '', people: '1명', qrValue: '' }
  const samplePlan = trip.plans.find((p) => p.sample)
  const baseDate = dateAt(trip, mode === 'new' ? (isSample ? samplePlan?.day ?? 0 : Math.min(dayIndex, trip.days.length-1)) : plan!.day)
  const qrValue = draft?.kind === 'file' ? draft.qrValue ?? '' : base.qrValue

  // 새 바우처: 입장 시간 칸을 누르면 원본 값으로 고쳐짐 / 등록·수정: 처음부터 맞는 값
  const [fixed, setFixed] = useState(mode !== 'new' || !isSample)
  const [title, setTitle] = useState(base.title)
  const [date, setDate] = useState(baseDate)
  const [time, setTime] = useState(base.time)
  const [code, setCode] = useState(base.code)
  const [people, setPeople] = useState(base.people)
  const [location, setLocation] = useState((mode === 'new' ? (isSample ? samplePlan?.location : undefined) : plan?.location) ?? '')
  const [qrText, setQrText] = useState(qrValue)
  const [toast, showToast] = useToast()

  const changed = title !== base.title || date !== baseDate || time !== base.time || code !== base.code || people !== base.people || qrText !== qrValue || location !== ((mode === 'new' ? samplePlan?.location : plan?.location) ?? '')

  const save = () => {
    const day = trip.days.findIndex((_, i) => dateAt(trip, i) === date)
    if (day < 0 || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) || !title.trim() || !code.trim() || new TextEncoder().encode(qrText.trim()).length > 2000) {
      showToast('여행 기간 내 날짜, 시간, 제목, 예약번호를 확인해 주세요.')
      return
    }
    const s = getDemoState()
    const original = draft?.original ?? plan?.original
    const values = { title: title.trim(), day, time, code: code.trim(), people: people.trim(), location: location.trim() || undefined, original, qrValue: qrText.trim() }
    const target = mode === 'new' ? (isSample ? samplePlan : undefined) : plan
    if (target) editPlan(target.id, values)
    else addPlan(trip.id, { ...values, id: crypto.randomUUID(), icon: 'ticket', source: { kind: 'self', via: draft?.kind === 'file' ? '첨부 파일' : '직접 입력' } })
    if (mode === 'new') {
      setDemoState({ saved: { ...s.saved, ...(isSample ? { [trip.id]: true } : {}) }, dayIndex: day, voucherTarget: undefined, draft: undefined })
      go('timeline', { toast: `${title} · 「${trip.name}」에 저장했어요` })
    } else if (mode === 'register') {
      setDemoState({ registered: { ...s.registered, [plan!.id]: true }, dayIndex: day, voucherTarget: undefined, draft: undefined })
      go('plan', { toast: '바우처를 등록했어요' })
    } else {
      setDemoState({ edited: { ...s.edited, [plan!.id]: true }, dayIndex: day, voucherTarget: undefined, draft: undefined })
      go('plan', { toast: '바우처를 수정했어요' })
    }
  }

  return (
    <Screen bg="#fff" label="추출 결과 확인">
      <button type="button" className={shared.back} aria-label="뒤로" onClick={back}>
        <IconBack />
      </button>

      <div className={styles.head}>
        <p className={styles.provider}>{base.provider}</p>
        <input className={cn(styles.title, styles.inline)} value={title} onChange={(e) => setTitle(e.target.value)} aria-label="제목" />
        <p className={styles.file}>{base.file}</p>
      </div>

      {/* 원본 PDF → 추출된 QR */}
      <button
        type="button"
        className={cn(styles.panel, shared.tappable)}
        onClick={() => showToast(isSample ? '시연에 사용할 샘플 QR이에요.' : qrText ? '이 QR 값을 저장해요.' : 'QR 값을 직접 입력하거나 나중에 추가할 수 있어요.')}
      >
        <span className={styles.doc} aria-hidden>
          {[60, 46, 32, 60, 46, 32].map((w, i) => (
            <span key={i} className={styles.docLine} style={{ width: w }} />
          ))}
          <span className={styles.docQr}>
            {qrText && <QrCode value={qrText} size={34} color="#9aa9ac" />}
          </span>
        </span>
        <span className={styles.arrow} aria-hidden>
          <IconArrowRight />
        </span>
        <span className={styles.qrCard}>
          {qrText ? <QrCode value={qrText} size={88} /> : <span>QR 없음</span>}
          <span className={styles.page}>내 QR</span>
        </span>
      </button>

      <dl className={cn(styles.fields, !isSample && styles.fieldsMore)}>
        <div className={styles.field}>
          <dt>날짜</dt>
          <dd>
            <input className={styles.inline} type="date" min={trip.startIso} max={dateAt(trip, trip.days.length-1)} value={date} onChange={(e) => setDate(e.target.value)} aria-label="날짜" />
          </dd>
        </div>
        <div className={styles.field}>
          <dt>입장</dt>
          <dd>
            {fixed ? (
              <input className={styles.inline} type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="입장 시간" />
            ) : (
              <button
                type="button"
                className={cn(styles.warn, shared.tappable)}
                onClick={() => setFixed(true)}
                aria-label={`입장 ${base.wrongTime}, 원본과 다름. 눌러서 고치기`}
              >
                <span className={styles.warnDot} aria-hidden />
                {base.wrongTime}
              </button>
            )}
          </dd>
        </div>
        <div className={styles.field}>
          <dt>예약번호</dt>
          <dd>
            <input className={styles.inline} value={code} onChange={(e) => setCode(e.target.value)} aria-label="예약번호" />
          </dd>
        </div>
        {!isSample && <div className={styles.field}><dt>QR 값</dt><dd><input className={styles.inline} value={qrText} maxLength={800} onChange={e => setQrText(e.target.value)} aria-label="QR 값" placeholder="선택 입력" /></dd></div>}
        <div className={styles.field}>
          <dt>인원</dt>
          <dd>
            <input className={styles.inline} value={people} onChange={(e) => setPeople(e.target.value)} aria-label="인원" />
          </dd>
        </div>
        {!isSample && <div className={styles.field}><dt>장소</dt><dd><input className={styles.inline} value={location} onChange={e => setLocation(e.target.value)} aria-label="장소" placeholder="선택 입력" /></dd></div>}
      </dl>

      <p className={styles.note}>
        {!fixed ? `원본 PDF의 입장 시간은 ${base.time}이에요 · 눌러서 고치기` : '값을 눌러서 바로 고칠 수 있어요'}
        <br />
        {isSample ? `${people} 예약 · 시연에 쓰는 샘플 정보예요` : '원본과 비교해 값을 입력해 주세요.'}
      </p>

      <button type="button" className={cn(shared.cta, shared.ctaTeal, shared.tappable)} onClick={save}>
        {mode === 'edit'
          ? changed
            ? '수정 저장'
            : '그대로 저장'
          : mode === 'register'
            ? '이 일정에 등록'
            : fixed
              ? '저장'
              : `${base.time}으로 고치고 저장`}
      </button>

      {toast}
    </Screen>
  )
}
