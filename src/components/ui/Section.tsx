import type { ReactNode } from 'react'
import Container from './Container'
import styles from './Section.module.css'

interface Props {
  id?: string
  title?: string
  subtitle?: string
  children: ReactNode
}

export default function Section({ id, title, subtitle, children }: Props) {
  return (
    <section id={id} className={styles.section}>
      <Container>
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
