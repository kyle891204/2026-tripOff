import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import s from '../partner.module.css'

interface Props {
  title: string
  description?: string
  children: ReactNode
}

/** 번호가 붙은 폼 섹션 카드 */
export default function Card({ title, description, children }: Props) {
  return (
    <section className={cn(s.card, s.section)}>
      <div className={s.cardHeading}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  )
}
