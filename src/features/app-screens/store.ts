import { useSyncExternalStore } from 'react'
import { TRIPS, type Trip } from './mock'

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
}

const INITIAL: DemoState = { tripId: 'osaka', dayIndex: 0, saved: {}, customTrips: [] }

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
