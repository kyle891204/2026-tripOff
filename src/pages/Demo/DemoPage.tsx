import { Button, Section } from '@/components/ui'
import { DemoPlayer } from '@/features/demo'
import { ROUTES } from '@/lib/routes'
import styles from './DemoPage.module.css'

export default function DemoPage() {
  return (
    <Section mobileBare title="앱 시연" subtitle="오사카 여행 시나리오 · 바우처 추가부터 현장 입장까지">
      <div className={styles.switch}>
        <Button to={ROUTES.partner} variant="outline">
          관리자 화면(파트너센터) 보기
        </Button>
      </div>
      <DemoPlayer />
    </Section>
  )
}
