import { cn } from '@/lib/cn'
import type { PlanIcon as Kind } from '../mock'
import { IconBed, IconBus, IconPlane, IconShip, IconTicketCoral } from './icons'
import shared from './shared.module.css'

interface Props {
  kind: Kind
  coral?: boolean
  /** 여행사가 보낸 일정이면 이름 (아이콘 모서리에 작은 마크) */
  agency?: string
}

/** 일정 종류별 아이콘 + 아이콘 상자. 입장권(ticket)·겹침 일정은 coral 톤 */
export default function PlanIcon({ kind, coral, agency }: Props) {
  const warm = coral || kind === 'ticket'
  return (
    <span className={cn(shared.iconBox, warm && shared.iconBoxCoral, shared.iconBoxMarked)}>
      {agency && <AgencyMark name={agency} />}
      {kind === 'plane' && <IconPlane />}
      {kind === 'bus' && <IconBus tone={coral ? 'coral' : 'teal'} />}
      {kind === 'bed' && <IconBed />}
      {kind === 'ship' && <IconShip />}
      {kind === 'ticket' && <IconTicketCoral />}
    </span>
  )
}

/** 여행사가 보낸 일정 표시: 작은 체크 점 */
export function AgencyMark({ name }: { name: string }) {
  return (
    <span className={shared.agencyMark} role="img" aria-label={`${name}(여행사)에서 보낸 일정`} title={`${name}에서 보낸 일정`}>
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
        <path d="M1.5 4.2 3.2 5.8 6.5 2.4" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
