import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import s from '../partner.module.css'

interface Props {
  label: string
  htmlFor: string
  children: ReactNode
  className?: string
}

/** 라벨 + 입력 요소 묶음 (Figma Field) */
export default function Field({ label, htmlFor, children, className }: Props) {
  return (
    <div className={cn(s.field, className)}>
      <label className={s.fieldLabel} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}
