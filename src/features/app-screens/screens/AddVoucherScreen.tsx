import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import InquiryPanel from '../parts/InquiryPanel'
import { IconBack, IconChevronRight, IconFile, IconImage, IconKeyboard } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { useCurrentPlan, useCurrentTrip, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import TimelineScreen from './TimelineScreen'
import styles from './AddVoucherScreen.module.css'

interface Option {
  icon: ReactNode
  title: string
  desc: string
}

/** 시연에서는 세 경로 모두 같은 흐름으로 추출 결과 화면에 들어감 */
const OPTIONS: Option[] = [
  { icon: <IconFile />, title: '파일에서', desc: 'PDF · 메일' },
  { icon: <IconImage />, title: '사진에서', desc: '캡처 이미지' },
  { icon: <IconKeyboard />, title: '직접 입력', desc: '예약번호만 있어요' },
]

/**
 * Figma 18:74 「바우처 추가」 — 여행(타임라인) 안에서 여는 바텀시트.
 * - 새 바우처: 이 여행에 새 일정으로 들어감
 * - 일정에 바우처 등록: 여행사가 바우처 없이 보낸 일정에 붙임 (일정 상세에서 진입)
 * - 「등록이 안 되나요?」 → 문의 창구
 */
export default function AddVoucherScreen({ go, back }: ScreenProps) {
  const trip = useCurrentTrip()
  const plan = useCurrentPlan()
  const { voucherTarget } = useDemoState()
  const target = voucherTarget?.mode === 'register' ? plan : undefined
  const [view, setView] = useState<'menu' | 'help'>('menu')
  const [toast, showToast] = useToast()

  const sheet = (
    <>
      <button type="button" className={styles.dim} aria-label="닫기" onClick={back} />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="바우처 추가">
        <span className={styles.handle} aria-hidden />

        {view === 'menu' ? (
          <>
            <h2 className={styles.title}>{target ? '바우처 등록' : '바우처 추가'}</h2>
            <p className={styles.context}>
              {target ? `「${target.title}」 일정에 붙여요` : `「${trip.name}」 · ${trip.period}에 추가돼요`}
            </p>
            <ul className={styles.list}>
              {OPTIONS.map((o) => (
                <li key={o.title}>
                  <button type="button" className={cn(styles.row, shared.tappable)} onClick={() => go('review')}>
                    <span className={cn(shared.iconBox, shared.iconBoxWhite)}>{o.icon}</span>
                    <span className={styles.text}>
                      <strong>{o.title}</strong>
                      <span>{o.desc}</span>
                    </span>
                    <IconChevronRight />
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.helpLink} onClick={() => setView('help')}>
              바우처 등록이 안 되나요? <strong>문의하기</strong>
            </button>
          </>
        ) : (
          <>
            <div className={styles.subHead}>
              <button type="button" className={styles.subBack} aria-label="바우처 추가로" onClick={() => setView('menu')}>
                <IconBack />
              </button>
              <h2 className={styles.title}>문의하기</h2>
            </div>
            <div className={styles.helpBody}>
              <InquiryPanel
                agency={target?.source.kind === 'agency' ? target.source.name : undefined}
                subject={target ? `「${target.title}」 바우처 등록` : '바우처 등록'}
                onDone={(m) => {
                  setView('menu')
                  showToast(m)
                }}
              />
            </div>
          </>
        )}
      </div>
      {toast}
    </>
  )

  return <TimelineScreen go={go} back={back} overlay={sheet} />
}
