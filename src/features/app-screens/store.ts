import { useSyncExternalStore } from 'react'
import type { Trip } from './mock'

/**
 * 화면 사이에 이어지는 시연 상태 (아주 작은 전역 스토어).
 * 어떤 여행·날짜를 보고 있는지, 바우처를 저장했는지.
 */
export interface DemoState {
  tripId: Trip['id']
  dayIndex: number
  /** 여행별 「바우처 추가」 샘플 저장 여부 */
  saved: Partial<Record<Trip['id'], boolean>>
}

const INITIAL: DemoState = { tripId: 'osaka', dayIndex: 0, saved: {} }

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
