import { useSyncExternalStore } from 'react'
import { TRIPS, isVisible, type Plan, type Trip } from './mock'

/**
 * 화면 사이에 이어지는 시연 상태 (아주 작은 전역 스토어).
 * 어떤 여행·날짜를 보고 있는지, 바우처를 저장했는지.
 */
export interface DemoState {
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
}

export interface PlanEdit {
  title?: string
  time?: string
  note?: string
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
}

let state: DemoState = INITIAL
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function setDemoState(patch: Partial<DemoState>) {
  state = { ...state, ...patch }
  emit()
}

export function resetDemoState() {
  state = INITIAL
  emit()
}

export function getDemoState() {
  return state
}

export function useDemoState() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

/** 기본 여행 + 새로 만든 여행 */
export function allTrips(s: DemoState = state): Trip[] {
  return [...TRIPS, ...s.customTrips]
}

/** 지금 선택된 여행 (없으면 첫 여행) */
export function useCurrentTrip(): Trip {
  const s = useDemoState()
  return allTrips(s).find((t) => t.id === s.tripId) ?? TRIPS[0]
}

/** 여행의 전체 일정 (보이는 것만), 날짜·시간순 */
export function tripPlans(trip: Trip, s: DemoState = state): Plan[] {
  return trip.plans
    .filter((p) => isVisible(p, !!s.saved[trip.id]))
    .map((p) => withEdits(p, s))
    .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))
}

/** 이 일정에 바우처가 있는지 (여행사가 안 보낸 경우 사용자가 등록하면 생김) */
export function hasVoucher(plan: Plan, s: DemoState = state) {
  return plan.voucher !== 'missing' || !!s.registered[plan.id]
}

/** 지금 보고 있는 일정 (없으면 undefined) */
export function useCurrentPlan(): Plan | undefined {
  const s = useDemoState()
  const trip = allTrips(s).find((t) => t.id === s.tripId) ?? TRIPS[0]
  const plan = trip.plans.find((p) => p.id === s.planId)
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
