import { cn } from '@/lib/cn'
import type { PlanIcon as Kind } from '../mock'
import { IconBed, IconBus, IconPlane, IconShip, IconTicketCoral } from './icons'
import shared from './shared.module.css'

/** 일정 종류별 아이콘 + 아이콘 상자. 입장권(ticket)·겹침 일정은 coral 톤 */
export default function PlanIcon({ kind, coral }: { kind: Kind; coral?: boolean }) {
  const warm = coral || kind === 'ticket'
  return (
    <span className={cn(shared.iconBox, warm && shared.iconBoxCoral)}>
      {kind === 'plane' && <IconPlane />}
      {kind === 'bus' && <IconBus tone={coral ? 'coral' : 'teal'} />}
      {kind === 'bed' && <IconBed />}
      {kind === 'ship' && <IconShip />}
      {kind === 'ticket' && <IconTicketCoral />}
    </span>
  )
}

/** 여행사 일정 표시 배지 */
export function AgencyBadge() {
  return <span className={shared.agencyBadge}>여행사</span>
}
