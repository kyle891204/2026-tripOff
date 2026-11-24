import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import s from '../partner.module.css'
import h from '@/features/demo/highlight.module.css'

interface Props {
  title: string
  description?: string
  children: ReactNode
  /** 스크롤 이동용 앵커 */
  id?: string
  /** 시연 중 방금 채워진 섹션 강조 */
  highlighted?: boolean
}

/** 번호가 붙은 폼 섹션 카드 */
export default function Card({ title, description, children, id, highlighted }: Props) {
  return (
    <section id={id} className={cn(s.card, s.section, highlighted && s.highlighted, highlighted && h.filling)}>
      <div className={s.cardHeading}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  )
}
