import { useSyncExternalStore } from 'react'
import { allTrips, setDemoState, tripPlans } from '@/features/app-screens/store'
import type { ScreenProps } from '@/features/app-screens/types'

const key = 'tripoff.notifications.v1'
const event = 'tripoff:notifications'

export interface DemoNotification {
  id: string
  title: string
  body: string
  tripId: string
  planId: string
  createdAt: string
  read: boolean
}

let lastRaw: string | null | undefined
let current: DemoNotification[] = []
function snapshot() {
  try {
    const raw = localStorage.getItem(key)
    if (raw === lastRaw) return current
    lastRaw = raw
    const parsed: unknown = JSON.parse(raw ?? '[]')
    current = Array.isArray(parsed) ? parsed : []
  } catch { /* 저장소를 쓰지 못하면 열린 탭에만 남겨 둡니다. */ }
  return current
}

function save(next: DemoNotification[]) {
  current = next
  try {
    lastRaw = JSON.stringify(next)
    localStorage.setItem(key, lastRaw)
  } catch { /* 열린 탭의 상태는 유지합니다. */ }
  window.dispatchEvent(new Event(event))
}

export function pushDemoNotification(input: Omit<DemoNotification, 'id' | 'createdAt' | 'read'>) {
  const next = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: false }
  save([next, ...snapshot()].slice(0, 30))
}

function subscribe(onChange: () => void) {
  const storage = (e: StorageEvent) => { if (e.key === key || e.key === null) onChange() }
  window.addEventListener(event, onChange)
  window.addEventListener('storage', storage)
  return () => {
    window.removeEventListener(event, onChange)
    window.removeEventListener('storage', storage)
  }
}

export function useDemoNotifications() {
  return useSyncExternalStore(subscribe, snapshot)
}

export function openDemoNotification(notification: DemoNotification, go: ScreenProps['go']) {
  save(snapshot().map(row => row.id === notification.id ? { ...row, read: true } : row))
  const trip = allTrips().find(row => row.id === notification.tripId)
  const plan = trip && tripPlans(trip).find(row => row.id === notification.planId)
  if (!trip || !plan) {
    go('notifications', { toast: '이 일정은 아직 저장되지 않았거나 취소됐어요.' })
    return
  }
  setDemoState({ tripId: trip.id, dayIndex: plan.day, planId: plan.id, voucherTarget: undefined, draft: undefined })
  go('plan')
}

export function notifyUpcomingDemo() {
  const trip = allTrips().find(row => row.id === 'osaka')
  const plans = trip ? tripPlans(trip) : []
  const plan = plans.find(row => row.id === 'o2') ?? plans.find(row => row.id === 'o4')
  if (!trip || !plan) return false
  pushDemoNotification({ title: '입장 30분 전이에요', body: `${plan.title} · ${plan.time} 입장`, tripId: trip.id, planId: plan.id })
  return true
}
