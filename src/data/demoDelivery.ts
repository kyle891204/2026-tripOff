import { makeTrip, type Plan, type Trip } from '@/features/app-screens/mock'

const key = 'tripoff.deliveries.v1'
const event = 'tripoff:deliveries'
export const DEMO_DELIVERY_ID = 'TO-2606-0618'
export const DEMO_AGENCY_TRIP_ID = 'agency-jeju-demo'

export interface DemoDelivery {
  id: string
  title: string
  date: string
  time: string
  location: string
  people: string
}

export function getDemoDeliveries(): DemoDelivery[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

export function syncDemoDelivery(delivery: DemoDelivery | null) {
  const rows = delivery ? [delivery] : []
  localStorage.setItem(key, JSON.stringify(rows))
  window.dispatchEvent(new Event(event))
}

export function subscribeDemoDeliveries(refresh: () => void) {
  window.addEventListener(event, refresh)
  window.addEventListener('storage', e => { if (e.key === key || e.key === null) refresh() })
}

// 시연용 고객 한 명에게만 전달합니다. 서버나 실제 알림톡은 호출하지 않습니다.
export function agencyTripFor(rows: DemoDelivery[]): Trip | undefined {
  if (!rows.length) return
  const first = rows[0]
  const trip = makeTrip('제주로드트립 · 고객 일정', first.date, first.date, 0)
  const plans: Plan[] = rows.map(row => ({
    id: row.id, day: 0, title: row.title, time: row.time, source: { kind: 'agency', name: '제주로드트립' },
    icon: 'ticket', location: row.location, code: row.id, people: row.people, qrValue: row.id,
  }))
  return { ...trip, id: DEMO_AGENCY_TRIP_ID, plans: [...plans, ...trip.plans] }
}
