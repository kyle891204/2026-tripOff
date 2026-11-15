import { DEMO_SCREENS } from '@/data/screens'
import { Section } from '@/components/ui'
import { ScreenViewer } from '@/features/demo'

export default function DemoPage() {
  return (
    <Section title="앱 시연" subtitle="화면을 선택해 주요 흐름을 확인하세요">
      <ScreenViewer screens={DEMO_SCREENS} />
    </Section>
  )
}
