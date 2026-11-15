import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { IconChevronRight, IconFile, IconImage, IconKeyboard } from '../parts/icons'
import shared from '../parts/shared.module.css'
import type { ScreenProps } from '../types'
import HomeScreen from './HomeScreen'
import styles from './AddVoucherScreen.module.css'

interface Option {
  icon: ReactNode
  title: string
  desc: string
}

/** 시연에서는 세 경로 모두 같은 샘플(USJ 입장권)로 추출 결과 화면에 들어감 */
const OPTIONS: Option[] = [
  { icon: <IconFile />, title: '파일에서', desc: 'PDF · 메일' },
  { icon: <IconImage />, title: '사진에서', desc: '캡처 이미지' },
  { icon: <IconKeyboard />, title: '직접 입력', desc: '예약번호만 있어요' },
]

/** Figma 18:74 「바우처 추가」 — 홈 위 바텀시트 */
export default function AddVoucherScreen({ go, back }: ScreenProps) {
  const sheet = (
    <>
      <button type="button" className={styles.dim} aria-label="닫기" onClick={back} />
      <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="바우처 추가">
        <span className={styles.handle} aria-hidden />
        <h2 className={styles.title}>바우처 추가</h2>
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
        <p className={styles.note}>메일 앱의 공유 버튼으로도 바로 들어와요</p>
      </div>
    </>
  )

  return <HomeScreen go={go} back={back} overlay={sheet} />
}
