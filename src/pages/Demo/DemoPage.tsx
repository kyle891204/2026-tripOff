import Container from '@/components/ui/Container'
import { DemoPlayer } from '@/features/demo'
import styles from './DemoPage.module.css'

export default function DemoPage() {
  return <section className={styles.page} aria-label="앱 시연"><Container><DemoPlayer /></Container></section>
}
