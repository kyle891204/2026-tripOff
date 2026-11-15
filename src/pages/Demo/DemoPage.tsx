import { DEMO_SCREENS } from '@/data/screens'
import { Button, Section } from '@/components/ui'
import { ScreenViewer } from '@/features/demo'
import { ROUTES } from '@/lib/routes'
import styles from './DemoPage.module.css'

export default function DemoPage() {
  return (
    <Section title="앱 시연" subtitle="화면을 선택해 주요 흐름을 확인하세요">
      <div className={styles.switch}>
        <Button to={ROUTES.partner} variant="outline">
          관리자 화면(파트너센터) 보기
        </Button>
      </div>
      <ScreenViewer screens={DEMO_SCREENS} />
    </Section>
  )
}
