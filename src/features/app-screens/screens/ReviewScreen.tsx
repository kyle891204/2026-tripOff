import { useState } from 'react'
import { cn } from '@/lib/cn'
import QrCode from '../parts/QrCode'
import Screen from '../parts/Screen'
import { IconArrowRight, IconBack } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { VOUCHER } from '../mock'
import type { ScreenProps } from '../types'
import styles from './ReviewScreen.module.css'

/** Figma 18:167 「추출 결과 확인」 — 원본과 다른 입장 시간을 잡아내는 화면 */
export default function ReviewScreen({ go, back }: ScreenProps) {
  // 입장 시간 칸을 누르면 원본 값(14:00)으로 바로 고쳐짐
  const [fixed, setFixed] = useState(false)
  const [toast, showToast] = useToast()

  return (
    <Screen bg="#fff" label="추출 결과 확인">
      <button type="button" className={shared.back} aria-label="뒤로" onClick={back}>
        <IconBack />
      </button>

      <div className={styles.head}>
        <p className={styles.provider}>{VOUCHER.provider}</p>
        <h1 className={styles.title}>{VOUCHER.title}</h1>
        <p className={styles.file}>{VOUCHER.file}</p>
      </div>

      {/* 원본 PDF → 추출된 QR */}
      <button
        type="button"
        className={cn(styles.panel, shared.tappable)}
        onClick={() => showToast('원본 PDF 1쪽에서 QR 3개를 찾았어요')}
      >
        <span className={styles.doc} aria-hidden>
          {[60, 46, 32, 60, 46, 32].map((w, i) => (
            <span key={i} className={styles.docLine} style={{ width: w }} />
          ))}
          <span className={styles.docQr}>
            <QrCode value={VOUCHER.qrValue} size={34} color="#9aa9ac" />
          </span>
        </span>
        <span className={styles.arrow} aria-hidden>
          <IconArrowRight />
        </span>
        <span className={styles.qrCard}>
          <QrCode value={VOUCHER.qrValue} size={88} />
          <span className={styles.page}>1 / 3</span>
        </span>
      </button>

      <dl className={styles.fields}>
        <div className={styles.field}>
          <dt>날짜</dt>
          <dd>{VOUCHER.date}</dd>
        </div>
        <div className={styles.field}>
          <dt>입장</dt>
          <dd>
            <button
              type="button"
              className={cn(styles.warn, fixed && styles.fixed, shared.tappable)}
              onClick={() => setFixed((f) => !f)}
              aria-label={fixed ? `입장 ${VOUCHER.time}, 원본과 같음` : `입장 ${VOUCHER.wrongTime}, 원본과 다름. 눌러서 고치기`}
            >
              <span className={styles.warnDot} aria-hidden />
              {fixed ? VOUCHER.time : VOUCHER.wrongTime}
            </button>
          </dd>
        </div>
        <div className={styles.field}>
          <dt>예약번호</dt>
          <dd>{VOUCHER.code}</dd>
        </div>
        <div className={styles.field}>
          <dt>인원</dt>
          <dd>{VOUCHER.people}</dd>
        </div>
      </dl>

      <p className={styles.note}>
        {fixed ? '원본 PDF와 같아요' : `원본 PDF의 입장 시간은 ${VOUCHER.time}이에요`}
      </p>

      <button
        type="button"
        className={cn(shared.cta, shared.ctaTeal, shared.tappable)}
        onClick={() => go('timeline')}
      >
        {fixed ? '저장' : `${VOUCHER.time}으로 고치고 저장`}
      </button>

      {toast}
    </Screen>
  )
}
