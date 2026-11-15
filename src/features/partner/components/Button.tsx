import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import s from '../partner.module.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  block?: boolean
  size?: 'md' | 'lg'
}

/** 파트너센터 버튼 (Figma Button/Primary · Secondary · Outline Blue · Danger) */
export default function PartnerButton({ variant = 'secondary', block, size = 'md', className, type = 'button', ...rest }: Props) {
  return <button type={type} className={cn(s.btn, s[variant], block && s.block, size === 'lg' && s.lg, className)} {...rest} />
}
