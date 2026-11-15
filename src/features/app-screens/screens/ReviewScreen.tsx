import { useState } from 'react'
import { cn } from '@/lib/cn'
import QrCode from '../parts/QrCode'
import Screen from '../parts/Screen'
import { IconArrowRight, IconBack } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { getDemoState, setDemoState, useCurrentTrip } from '../store'
import type { ScreenProps } from '../types'
import styles from './ReviewScreen.module.css'

/** Figma 18:167 「추출 결과 확인」 — 원본과 다른 입장 시간을 잡아내는 화면 */
export default function ReviewScreen({ go, back }: ScreenProps) {
  // 입장 시간 칸을 누르면 원본 값으로 바로 고쳐짐
  const [fixed, setFixed] = useState(false)
  const [toast, showToast] = useToast()
  const trip = useCurrentTrip()
  const voucher = trip.sample
  const samplePlan = trip.plans.find((p) => p.sample)

  const save = () => {
    setDemoState({ saved: { ...getDemoState().saved, [trip.id]: true }, dayIndex: samplePlan?.day ?? 0 })
    go('timeline', { toast: `${voucher.title} · ${trip.city} 여행에 저장했어요` })
  }

  return (
    <Screen bg="#fff" label="추출 결과 확인">
      <button type="button" className={shared.back} aria-label="뒤로" onClick={back}>
        <IconBack />
      </button>

      <div className={styles.head}>
        <p className={styles.provider}>{voucher.provider}</p>
        <h1 className={styles.title}>{voucher.title}</h1>
        <p className={styles.file}>{voucher.file}</p>
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
            <QrCode value={voucher.qrValue} size={34} color="#9aa9ac" />
          </span>
        </span>
        <span className={styles.arrow} aria-hidden>
          <IconArrowRight />
        </span>
        <span className={styles.qrCard}>
          <QrCode value={voucher.qrValue} size={88} />
          <span className={styles.page}>내 QR</span>
        </span>
      </button>

      <dl className={styles.fields}>
        <div className={styles.field}>
          <dt>날짜</dt>
          <dd>{voucher.date}</dd>
        </div>
        <div className={styles.field}>
          <dt>입장</dt>
          <dd>
            <button
              type="button"
              className={cn(styles.warn, fixed && styles.fixed, shared.tappable)}
              onClick={() => setFixed((f) => !f)}
              aria-label={fixed ? `입장 ${voucher.time}, 원본과 같음` : `입장 ${voucher.wrongTime}, 원본과 다름. 눌러서 고치기`}
            >
              <span className={styles.warnDot} aria-hidden />
              {fixed ? voucher.time : voucher.wrongTime}
            </button>
          </dd>
        </div>
        <div className={styles.field}>
          <dt>예약번호</dt>
          <dd>{voucher.code}</dd>
        </div>
        <div className={styles.field}>
          <dt>인원</dt>
          <dd>{voucher.people}</dd>
        </div>
      </dl>

      <p className={styles.note}>
        {fixed ? '원본 PDF와 같아요' : `원본 PDF의 입장 시간은 ${voucher.time}이에요`}
        <br />
        {voucher.people} 예약 · 동행에게는 각자 자기 QR 만 전달돼요
      </p>

      <button
        type="button"
        className={cn(shared.cta, shared.ctaTeal, shared.tappable)}
        onClick={save}
      >
        {fixed ? '저장' : `${voucher.time}으로 고치고 저장`}
      </button>

      {toast}
    </Screen>
  )
}
