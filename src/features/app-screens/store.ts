import { useSyncExternalStore } from 'react'
import { TRIPS, isVisible, type Plan, type Trip } from './mock'
import { agencyTripFor, getDemoDeliveries, subscribeDemoDeliveries } from '@/data/demoDelivery'

/**
 * 화면 사이에 이어지는 시연 상태 (아주 작은 전역 스토어).
 * 어떤 여행·날짜를 보고 있는지, 바우처를 저장했는지.
 */
export interface ShopBooking {
  id: string
  productId: string
  optionIndex: number
  tripId: string
  date: string
  time: string
  count: number
  price: number
  seller: string
  title: string
}
export interface DemoState {
  shopProductId?: string
  shopBooking?: ShopBooking
  shopOrders?: ShopBooking[]

  tripId: string
  dayIndex: number
  /** 여행별 「바우처 추가」 샘플 저장 여부 */
  saved: Record<string, boolean>
  /** 시연 중 「여행 추가」로 만든 여행 */
  customTrips: Trip[]
  /** 지금 보고 있는 일정 (일정 상세·티켓) */
  planId?: string
  /** 사용자가 직접 바우처를 등록한 일정 */
  registered: Record<string, boolean>
  /** 바우처를 수정한 일정 */
  edited: Record<string, boolean>
  /** 「바우처 추가 → 추출 확인」 흐름의 대상. 없으면 새 바우처(샘플) 추가 */
  voucherTarget?: { planId: string; mode: 'register' | 'edit' }
  /** 사용자가 고친 일정 내용 (제목·시간·장소) */
  planEdits: Record<string, PlanEdit>
  /** 여행별 「동행 티켓 함께 보기」 */
  shareTickets: Record<string, boolean>
  addedPlans: Record<string, Plan[]>
  draft?: { kind: 'sample' | 'manual' | 'file'; original?: Plan['original']; qrValue?: string }
}

export interface PlanEdit {
  title?: string
  time?: string
  note?: string
  location?: string
  day?: number
  original?: Plan['original']
  qrValue?: string
  code?: string
  people?: string
}

const INITIAL: DemoState = {
  tripId: 'osaka',
  dayIndex: 0,
  saved: {},
  customTrips: [],
  registered: {},
  edited: {},
  planEdits: {},
  shareTickets: {},
  addedPlans: {},
}

const STORAGE_KEY = 'tripoff.traveler.v1'
function loadState(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...INITIAL, ...JSON.parse(raw), planId: undefined, voucherTarget: undefined, draft: undefined } : INITIAL
  } catch { return INITIAL }
}
let state: DemoState = loadState()
function persist() {
  const { draft: _draft, voucherTarget: _target, planId: _plan, ...data } = state
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* 읽기 전용 환경에서는 메모리만 사용 */ }
}
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function setDemoState(patch: Partial<DemoState>) {
  state = { ...state, ...patch }
  persist()
  emit()
}

export function resetDemoState() {
  state = INITIAL
  persist()
  emit()
}

export function getDemoState() {
  return state
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}
subscribeDemoDeliveries(() => { state = { ...state }; emit() })
export function useDemoState() {
  return useSyncExternalStore(subscribe, getDemoState)
}

/** 기본 여행 + 새로 만든 여행 */
export function allTrips(s: DemoState = state): Trip[] {
  const agency = agencyTripFor(getDemoDeliveries())
  return [...TRIPS, ...(agency ? [agency] : []), ...s.customTrips]
}

/** 지금 선택된 여행 (없으면 첫 여행) */
export function useCurrentTrip(): Trip {
  const s = useDemoState()
  return allTrips(s).find((t) => t.id === s.tripId) ?? TRIPS[0]
}

/** 여행의 전체 일정 (보이는 것만), 날짜·시간순 */
export function tripPlans(trip: Trip, s: DemoState = state): Plan[] {
  const plans = [...trip.plans, ...(s.addedPlans[trip.id] ?? [])]
    .filter((p) => isVisible(p, !!s.saved[trip.id]))
    .map((p) => withEdits(p, s))
    .sort((a, b) => a.day - b.day || minutes(a.time) - minutes(b.time))
  return plans.map((plan, i) => {
    const start = minutes(plan.time)
    const duration = plan.durationMinutes ?? 0
    const next = plans.slice(i+1).find(p => p.day === plan.day && minutes(p.time) < start + duration)
    const previous = plans.slice(0,i).some(p => p.day === plan.day && minutes(p.time) + (p.durationMinutes ?? 0) > start)
    return { ...plan, conflict: !!next || previous, warnAfter: next ? { text: next.icon === 'bus' ? '관람 중 셔틀 출발' : '일정 시간 겹침', detail: `${plan.title} 이용 중 ${next.title} 일정이 ${next.time}에 시작해요.` } : undefined }
  })
}

/** 이 일정에 바우처가 있는지 (여행사가 안 보낸 경우 사용자가 등록하면 생김) */
function minutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function addPlan(tripId: string, plan: Plan) {
  setDemoState({ addedPlans: { ...state.addedPlans, [tripId]: [...(state.addedPlans[tripId] ?? []), plan] } })
}

export function nextStoredTicket(trip: Trip, s: DemoState = state) {
  return tripPlans(trip, s).find(p => p.day >= s.dayIndex && (p.icon === 'ticket' || p.icon === 'ship') && hasVoucher(p, s) && p.qrValue !== '')
}

export function hasVoucher(plan: Plan, s: DemoState = state) {
  return plan.voucher !== 'missing' || !!s.registered[plan.id]
}

/** 지금 보고 있는 일정 (없으면 undefined) */
export function useCurrentPlan(): Plan | undefined {
  const s = useDemoState()
  const trip = allTrips(s).find((t) => t.id === s.tripId) ?? TRIPS[0]
  const plan = [...trip.plans, ...(s.addedPlans[trip.id] ?? [])].find((p) => p.id === s.planId)
  return plan && withEdits(plan, s)
}

/** 사용자가 고친 내용을 덮어쓴 일정 */
export function withEdits(plan: Plan, s: DemoState = state): Plan {
  const e = s.planEdits[plan.id]
  return e ? { ...plan, ...e } : plan
}

/** 일정 내용 고치기 */
export function editPlan(planId: string, edit: PlanEdit) {
  setDemoState({ planEdits: { ...state.planEdits, [planId]: { ...state.planEdits[planId], ...edit } } })
}
