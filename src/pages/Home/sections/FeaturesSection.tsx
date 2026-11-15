import { FEATURES } from '@/data/features'
import { Section } from '@/components/ui'
import styles from './FeaturesSection.module.css'

export default function FeaturesSection() {
  return (
    <Section id="features" title="주요 기능" subtitle="앱의 핵심 기능을 소개합니다">
      <ul className={styles.grid}>
        {FEATURES.map((f) => (
          <li key={f.id} className={styles.card}>
            <span className={styles.icon} aria-hidden>
              {f.icon}
            </span>
            <h3 className={styles.title}>{f.title}</h3>
            <p className={styles.desc}>{f.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
