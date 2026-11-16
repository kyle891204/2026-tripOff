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

/** 여행사 상품(여행 발견에서 구매)으로 들어온 일정 표시: 작은 쇼핑백 배지 — 「여행 발견」 탭 아이콘과 같은 모양 */
export function AgencyMark({ name }: { name: string }) {
  return (
    <span className={shared.agencyMark} role="img" aria-label={`${name}(여행사) 상품으로 구매한 일정`} title={`${name} 상품`}>
      <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden>
        <path d="M4.5 8.5h15l-1.1 10.6a2 2 0 0 1-2 1.9H7.6a2 2 0 0 1-2-1.9zM8.5 8.5V7a3.5 3.5 0 0 1 7 0v1.5" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
