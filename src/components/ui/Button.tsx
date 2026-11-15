import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import styles from './Button.module.css'

type Variant = 'primary' | 'outline'

interface BaseProps {
  children: ReactNode
  variant?: Variant
  className?: string
}

/** to: 내부 라우트 이동 / href: 앵커(#id)·외부 링크 */
type Props = BaseProps & ({ to: string; href?: never } | { href: string; to?: never })

export default function Button({ variant = 'primary', className, children, ...rest }: Props) {
  const cls = cn(styles.button, styles[variant], className)

  if (rest.to !== undefined) {
    return (
      <Link to={rest.to} className={cls}>
        {children}
      </Link>
    )
  }

  const external = /^https?:\/\//.test(rest.href)
  return (
    <a
      href={rest.href}
      className={cls}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {children}
    </a>
  )
}
