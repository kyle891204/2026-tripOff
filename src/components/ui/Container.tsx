import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import styles from './Container.module.css'

interface Props {
  children: ReactNode
  className?: string
}

export default function Container({ children, className }: Props) {
  return <div className={cn(styles.container, className)}>{children}</div>
}
