import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import Container from './Container'
import styles from './Section.module.css'

interface Props {
  id?: string
  title?: string
  subtitle?: string
  mobileBare?: boolean
  children: ReactNode
}

export default function Section({ id, title, subtitle, mobileBare, children }: Props) {
  return (
    <section id={id} className={cn(styles.section, mobileBare && styles.mobileBare)}>
      <Container className={styles.content}>
        {(title || subtitle) && (
          <div className={styles.head}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  )
}
