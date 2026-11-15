import { Section } from '@/components/ui'
import { DemoPlayer } from '@/features/demo'

export default function DemoPage() {
  return (
    <Section title="앱 시연" subtitle="오사카 여행 시나리오 · 바우처 추가부터 현장 입장까지">
      <DemoPlayer />
    </Section>
  )
}
