import { ROUTES } from '@/lib/routes'
import { Button, Section } from '@/components/ui'

export default function NotFoundPage() {
  return (
    <Section title="페이지를 찾을 수 없어요" subtitle="주소를 다시 확인해 주세요">
      <div style={{ textAlign: 'center' }}>
        <Button to={ROUTES.home}>홈으로</Button>
      </div>
    </Section>
  )
}
