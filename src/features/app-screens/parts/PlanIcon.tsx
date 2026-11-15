import { cn } from '@/lib/cn'
import type { PlanIcon as Kind } from '../mock'
import { IconBed, IconBus, IconPlane, IconShip, IconTicketCoral, IconTicketGold } from './icons'
import shared from './shared.module.css'

interface Props {
  kind: Kind
  coral?: boolean
  /** 여행사가 보낸 일정이면 이름 (아이콘 모서리에 작은 마크) */
  agency?: string
}

/** 입장권은 노란색, 겹침 경고는 주황색으로 구분한다. */
export default function PlanIcon({ kind, coral, agency }: Props) {
  return (
    <span className={cn(shared.iconBox, coral ? shared.iconBoxCoral : kind === 'ticket' && shared.iconBoxGold, shared.iconBoxMarked)}>
      {agency && <AgencyMark name={agency} />}
      {kind === 'plane' && <IconPlane />}
      {kind === 'bus' && <IconBus tone={coral ? 'coral' : 'teal'} />}
      {kind === 'bed' && <IconBed />}
      {kind === 'ship' && <IconShip />}
      {kind === 'ticket' && (coral ? <IconTicketCoral /> : <IconTicketGold />)}
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
