import { SITE } from '@/data/site'
import { ROUTES } from '@/lib/routes'
import { Button, Container } from '@/components/ui'
import { PhoneFrame } from '@/features/demo'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <Container className={styles.inner}>
        <div>
          <h1 className={styles.title}>{SITE.tagline}</h1>
          <p className={styles.desc}>{SITE.description}</p>
          <div className={styles.actions}>
            <Button to={ROUTES.demo}>시연 보기</Button>
            <Button href="#features" variant="outline">
              기능 살펴보기
            </Button>
          </div>
        </div>
        <PhoneFrame>
          <div className={styles.placeholder}>메인 스크린샷</div>
        </PhoneFrame>
      </Container>
    </section>
  )
}
