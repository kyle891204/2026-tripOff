import { SITE } from '@/data/site'
import Container from '@/components/ui/Container'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <p>© {SITE.year} {SITE.team}</p>
      </Container>
    </footer>
  )
}
