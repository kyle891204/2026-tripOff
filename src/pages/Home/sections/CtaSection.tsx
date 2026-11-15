import { ROUTES } from '@/lib/routes'
import { Button, Section } from '@/components/ui'
import styles from './CtaSection.module.css'

export default function CtaSection() {
  return (
    <Section title="직접 확인해 보세요" subtitle="실제 앱 화면을 시연 페이지에서 볼 수 있습니다">
      <div className={styles.center}>
        <Button to={ROUTES.demo}>시연 페이지로</Button>
      </div>
    </Section>
  )
}
