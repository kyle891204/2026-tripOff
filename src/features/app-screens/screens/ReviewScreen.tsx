import { useState } from 'react'
import { cn } from '@/lib/cn'
import QrCode from '../parts/QrCode'
import Screen from '../parts/Screen'
import { IconArrowRight, IconBack } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { voucherOf } from '../mock'
import { editPlan, getDemoState, setDemoState, useCurrentPlan, useCurrentTrip, useDemoState } from '../store'
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
  const { voucherTarget } = useDemoState()
  // 대상 일정이 있으면 그 일정의 바우처를 등록/수정, 없으면 새 바우처(샘플) 추가
  const mode = voucherTarget && plan ? voucherTarget.mode : 'new'
  const base = mode === 'new' ? { ...trip.sample } : { ...voucherOf(plan!, trip), wrongTime: '' }
  const samplePlan = trip.plans.find((p) => p.sample)

  // 새 바우처: 입장 시간 칸을 누르면 원본 값으로 고쳐짐 / 등록·수정: 처음부터 맞는 값
  const [fixed, setFixed] = useState(mode !== 'new')
  const [title, setTitle] = useState(base.title)
  const [date, setDate] = useState(base.date)
  const [time, setTime] = useState(base.time)
  const [code, setCode] = useState(base.code)
  const [people, setPeople] = useState(base.people)
  const [toast, showToast] = useToast()

  const changed = title !== base.title || date !== base.date || time !== base.time || code !== base.code || people !== base.people

  const save = () => {
    const s = getDemoState()
    const target = mode === 'new' ? samplePlan : plan
    if (target) editPlan(target.id, { title, time, code, people })
    if (mode === 'new') {
      setDemoState({ saved: { ...s.saved, [trip.id]: true }, dayIndex: samplePlan?.day ?? 0, voucherTarget: undefined })
      go('timeline', { toast: `${title} · 「${trip.name}」에 저장했어요` })
    } else if (mode === 'register') {
      setDemoState({ registered: { ...s.registered, [plan!.id]: true }, voucherTarget: undefined })
      go('plan', { toast: '바우처를 등록했어요' })
    } else {
      setDemoState({ edited: { ...s.edited, [plan!.id]: true }, voucherTarget: undefined })
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
        onClick={() => showToast('원본 PDF에서 QR 3개를 찾았어요. 내 것만 저장하고 나머지는 동행에게 보내요')}
      >
        <span className={styles.doc} aria-hidden>
          {[60, 46, 32, 60, 46, 32].map((w, i) => (
            <span key={i} className={styles.docLine} style={{ width: w }} />
          ))}
          <span className={styles.docQr}>
            <QrCode value={base.qrValue} size={34} color="#9aa9ac" />
          </span>
        </span>
        <span className={styles.arrow} aria-hidden>
          <IconArrowRight />
        </span>
        <span className={styles.qrCard}>
          <QrCode value={base.qrValue} size={88} />
          <span className={styles.page}>내 QR</span>
        </span>
      </button>

      <dl className={styles.fields}>
        <div className={styles.field}>
          <dt>날짜</dt>
          <dd>
            <input className={styles.inline} value={date} onChange={(e) => setDate(e.target.value)} aria-label="날짜" />
          </dd>
        </div>
        <div className={styles.field}>
          <dt>입장</dt>
          <dd>
            {fixed ? (
              <input className={styles.inline} value={time} onChange={(e) => setTime(e.target.value)} aria-label="입장 시간" />
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
        <div className={styles.field}>
          <dt>인원</dt>
          <dd>
            <input className={styles.inline} value={people} onChange={(e) => setPeople(e.target.value)} aria-label="인원" />
          </dd>
        </div>
      </dl>

      <p className={styles.note}>
        {!fixed ? `원본 PDF의 입장 시간은 ${base.time}이에요 · 눌러서 고치기` : '값을 눌러서 바로 고칠 수 있어요'}
        <br />
        {mode === 'new' ? `${people} 예약 · 동행에게는 각자 자기 QR 만 전달돼요` : '내 티켓 1매만 저장돼요'}
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
