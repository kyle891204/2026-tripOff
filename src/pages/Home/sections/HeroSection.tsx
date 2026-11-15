import { useNavigate } from 'react-router'
import { SITE } from '@/data/site'
import { ROUTES } from '@/lib/routes'
import { Button, Container } from '@/components/ui'
import { HomeScreen } from '@/features/app-screens'
import { PhoneFrame } from '@/features/demo'
import styles from './HeroSection.module.css'

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className={styles.hero}>
      <Container className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>{SITE.name}</p>
          <h1 className={styles.title}>{SITE.tagline}</h1>
          <p className={styles.desc}>{SITE.description}</p>
          <div className={styles.actions}>
            <Button to={ROUTES.demo}>시연 보기</Button>
            <Button href="#features" variant="outline">
              기능 살펴보기
            </Button>
          </div>
        </div>
        {/* 실제 앱 홈 화면 — 누르면 시연 페이지로 */}
        <PhoneFrame>
          <HomeScreen go={() => navigate(ROUTES.demo)} back={() => navigate(ROUTES.demo)} />
        </PhoneFrame>
      </Container>
    </section>
  )
}
