import { useSyncExternalStore } from 'react'
import { DEMO_TODAY, PAST_TRIPS, TRIPS, dateAt, isVisible, makeTrip, type Plan, type PlanIcon, type Trip } from './mock'
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
  /** 이 주문으로 생긴 일정 (없으면 'shop-' + id) */
  planId?: string
  /** 결제 시각 ISO */
  paidAt?: string
  /** 주문 · 예약번호 (없으면 id 로 만듦) */
  no?: string
}

/** 주문 상태: 결제 완료 / 이용 완료 / 결제 취소 / 환불 요청 */
export type OrderStatus = 'paid' | 'used' | 'cancelled' | 'refund-requested'
export interface OrderChange { status: 'cancelled' | 'refund-requested'; at: string; reason?: string }

/** 푸시 알림 설정 */
export interface PushSettings {
  enabled: boolean
  voucher: boolean
  entry: boolean
  companion: boolean
  marketing: boolean
}
export const DEFAULT_PUSH: PushSettings = { enabled: true, voucher: true, entry: true, companion: true, marketing: false }
/** 잠금 방식과 사용 위치. 시연용이라 PIN·패턴은 이 브라우저에만 평문 저장 */
export type LockMethod = 'none' | 'biometric' | 'pattern' | 'pin'
export interface Security {
  method: LockMethod
  pin?: string
  /** 기기 생체 인식 등록 id (WebAuthn). 없으면 시연용 인식 */
  credentialId?: string
  /** 3×3 점 순서 (예: '0125') */
  pattern?: string
  /** 앱 실행 시 잠금 */
  onLaunch: boolean
  /** QR 열 때 잠금 */
  onQr: boolean
}
export const METHOD_LABEL: Record<LockMethod, string> = { none: '보안 없음', biometric: '생체 인식', pattern: '패턴', pin: 'PIN' }
export const NO_SECURITY: Security = { method: 'none', onLaunch: false, onQr: true }

export interface DemoState {
  security?: Security
  shopCountry?: string
  shopDestination?: string
  shopProductId?: string
  shopBooking?: ShopBooking
  shopOrders?: ShopBooking[]
  /** 지금 보고 있는 주문 (구매 내역 상세) */
  orderId?: string
  /** 결제 취소 · 환불 요청 기록 */
  orderChanges?: Record<string, OrderChange>
  /** 결제 취소로 빠진 일정 */
  hiddenPlans?: Record<string, boolean>
  /** 여행에 넣지 않은 내 일정 (이용일과 함께 따로 보관) */
  soloPlans?: SoloPlan[]
  /** 「내 일정 추가」를 여행 없이 진행 중 */
  addSolo?: boolean
  /** 상점 즐겨찾기 상품 id */
  favorites?: string[]
  push?: PushSettings

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
  /** 시연 시각 'YYYY-MM-DDTHH:MM'. 없으면 여행 전(DEMO_TODAY) */
  demoNow?: string
  /** 「일행 바우처 추가」 흐름의 대상 동행 이름 */
  voucherOwner?: string
  draft?: { kind: 'sample' | 'manual' | 'file'; original?: Plan['original']; qrValue?: string }
}

export interface SoloPlan { date: string; plan: Plan }

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
    return raw ? { ...INITIAL, ...JSON.parse(raw), planId: undefined, voucherTarget: undefined, draft: undefined, voucherOwner: undefined, addSolo: undefined } : INITIAL
  } catch { return INITIAL }
}
let state: DemoState = loadState()
function persist() {
  const { draft: _draft, voucherTarget: _target, planId: _plan, voucherOwner: _owner, addSolo: _solo, ...data } = state
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

/* --------------------------- 여행 밖 일정 --------------------------- */

const SOLO_PREFIX = 'solo-'

/**
 * 여행에 넣지 않은 일정 하나를 하루짜리 가상 여행으로 감싼 것.
 * 일정 상세·티켓·바우처 화면이 여행 일정과 같은 방식으로 다룰 수 있게 한다.
 * 여행 목록(allTrips)에는 나오지 않는다.
 */
export function soloTrips(s: DemoState = state): Trip[] {
  return (s.soloPlans ?? []).map(({ date, plan }) => ({
    ...makeTrip('여행 외 일정', date, date, 0),
    id: SOLO_PREFIX + plan.id, solo: true, plans: [{ ...plan, day: 0 }],
  }))
}

/** 여행 id로 찾기 (지난 여행, 여행 밖 일정 포함) */
export function findTrip(id: string, s: DemoState = state): Trip | undefined {
  return [...allTrips(s), ...PAST_TRIPS, ...soloTrips(s)].find((t) => t.id === id)
}

/** 그 날짜가 여행 기간에 들어가는 내 여행 (여행지 일치를 원하면 prefer로 앞에 정렬) */
export function tripsOn(date: string, prefer?: (trip: Trip) => boolean, s: DemoState = state): Trip[] {
  const trips = allTrips(s).filter((t) => t.startIso <= date && date <= t.endIso)
  return prefer ? [...trips.filter(prefer), ...trips.filter((t) => !prefer(t))] : trips
}

/** 여행에 넣지 않고 일정 저장. 돌려주는 값은 그 일정의 가상 여행 id */
export function addSoloPlan(date: string, plan: Plan, patch: Partial<DemoState> = {}) {
  setDemoState({ soloPlans: [...(state.soloPlans ?? []), { date, plan: { ...plan, day: 0 } }], ...patch })
  return SOLO_PREFIX + plan.id
}

/** 여행 밖 일정의 이용일 바꾸기 */
export function setSoloDate(planId: string, date: string) {
  setDemoState({ soloPlans: (state.soloPlans ?? []).map((entry) => entry.plan.id === planId ? { ...entry, date } : entry) })
}

/** 주문에 묶인 여행 id 바꾸기 (그 일정을 만든 주문) */
function ordersMoved(planId: string, tripId: string) {
  return state.shopOrders?.map((o) => (o.planId ?? 'shop-' + o.id) === planId ? { ...o, tripId } : o)
}

/** 여행 밖 일정을 여행으로 옮기기 (date 를 주면 그 날로). 주문에 묶인 여행 id도 함께 바꾼다 */
export function moveSoloToTrip(planId: string, tripId: string, date?: string) {
  const entry = state.soloPlans?.find((e) => e.plan.id === planId)
  const trip = allTrips().find((t) => t.id === tripId)
  if (!entry || !trip) return
  const day = trip.days.findIndex((_, i) => dateAt(trip, i) === (date ?? entry.date))
  if (day < 0) return
  const edit = state.planEdits[planId]
  setDemoState({
    soloPlans: state.soloPlans!.filter((e) => e.plan.id !== planId),
    addedPlans: { ...state.addedPlans, [trip.id]: [...(state.addedPlans[trip.id] ?? []), { ...entry.plan, day }] },
    planEdits: edit ? { ...state.planEdits, [planId]: { ...edit, day } } : state.planEdits,
    shopOrders: ordersMoved(planId, trip.id),
    tripId: state.tripId === SOLO_PREFIX + planId ? trip.id : state.tripId,
    dayIndex: state.tripId === SOLO_PREFIX + planId ? day : state.dayIndex,
  })
}

/** 여행에서 내가 추가한 일정 · 산 일정만 뺄 수 있다 (여행사가 보낸 기본 일정은 그 여행에 남음) */
export function canLeaveTrip(planId: string, tripId: string, s: DemoState = state) {
  return !!s.addedPlans[tripId]?.some((p) => p.id === planId && !p.owner)
}

/** 여행 일정을 여행 밖으로 빼기 (날짜는 그대로) */
export function moveTripPlanToSolo(planId: string, tripId: string) {
  const trip = allTrips().find((t) => t.id === tripId)
  const plan = state.addedPlans[tripId]?.find((p) => p.id === planId)
  if (!trip || !plan || plan.owner) return
  const edit = state.planEdits[planId]
  const date = dateAt(trip, edit?.day ?? plan.day)
  setDemoState({
    addedPlans: { ...state.addedPlans, [tripId]: state.addedPlans[tripId].filter((p) => p.id !== planId) },
    soloPlans: [...(state.soloPlans ?? []), { date, plan: { ...plan, day: 0 } }],
    planEdits: edit ? { ...state.planEdits, [planId]: { ...edit, day: 0 } } : state.planEdits,
    shopOrders: ordersMoved(planId, SOLO_PREFIX + planId),
    tripId: state.tripId === tripId ? SOLO_PREFIX + planId : state.tripId,
    dayIndex: state.tripId === tripId ? 0 : state.dayIndex,
  })
}

/** 지금 선택된 여행 (없으면 첫 여행) */
export function useCurrentTrip(): Trip {
  const s = useDemoState()
  return findTrip(s.tripId, s) ?? TRIPS[0]
}

/** 여행의 전체 일정 (보이는 것만), 날짜·시간순 */
export function tripPlans(trip: Trip, s: DemoState = state): Plan[] {
  const plans = [...trip.plans, ...(s.addedPlans[trip.id] ?? [])]
    .filter((p) => !p.owner && !s.hiddenPlans?.[p.id] && isVisible(p, !!s.saved[trip.id]))
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

/** 내가 대신 추가한 일행 바우처 (여행별), 날짜·시간순 */
export function companionVouchers(trip: Trip, s: DemoState = state): Plan[] {
  return (s.addedPlans[trip.id] ?? [])
    .filter((p) => p.owner)
    .map((p) => withEdits(p, s))
    .sort((a, b) => a.day - b.day || minutes(a.time) - minutes(b.time))
}

/** 소요 시간이 없는 일정의 기본 길이 (분) */
const DEFAULT_MINUTES: Record<PlanIcon, number> = { plane: 140, bus: 60, bed: 30, ship: 60, ticket: 120 }

export type PlanPhase = 'past' | 'live' | 'next'

/** 시연 시각 기준 일정 상태: 끝남 / 진행 중 / 예정 */
export function planPhase(plan: Plan, trip: Trip, s: DemoState = state): PlanPhase {
  if (!s.demoNow) return 'next'
  const [date, time] = s.demoNow.split('T')
  const day = dateAt(trip, plan.day)
  if (day !== date) return day < date ? 'past' : 'next'
  const now = minutes(time)
  const start = minutes(plan.time)
  if (now < start) return 'next'
  return now < start + (plan.durationMinutes ?? DEFAULT_MINUTES[plan.icon]) ? 'live' : 'past'
}

/** 시연 시각이 여행 기간 안이면 며칠째인지 (1부터), 아니면 undefined */
export function tripDayNow(trip: Trip, s: DemoState = state): number | undefined {
  if (!s.demoNow) return undefined
  const date = s.demoNow.slice(0, 10)
  const i = trip.days.findIndex((_, k) => dateAt(trip, k) === date)
  return i < 0 ? undefined : i + 1
}

export function securityOf(s: DemoState = state): Security {
  const sec = s.security ?? NO_SECURITY
  // 예전 저장값 「지문」 → 생체 인식(시연용)
  return (sec.method as string) === 'fingerprint' ? { ...sec, method: 'biometric' } : sec
}

/** 이 위치에서 본인 확인이 필요한지 */
export function needsAuth(where: 'launch' | 'qr', s: DemoState = state) {
  const sec = securityOf(s)
  return sec.method !== 'none' && (where === 'launch' ? sec.onLaunch : sec.onQr)
}

/* ------------------------------ 구매 내역 ------------------------------ */

/** 시연 기준 오늘 날짜 (시연 시각을 골랐으면 그 날짜) */
export function todayIso(s: DemoState = state) {
  return s.demoNow?.slice(0, 10) ?? DEMO_TODAY
}

/** 여행 발견에서 이미 산 것으로 시작하는 주문 (여행사 일정과 연결) */
export const SEED_ORDERS: ShopBooking[] = [
  { id: 'seed-osaka-namba', productId: 'seed', optionIndex: 0, tripId: 'osaka', date: '2026-06-12', time: '14:20', count: 1, price: 18000, seller: '오사카 로컬트립', title: '간사이공항 → 난바 셔틀', planId: 'o3', paidAt: '2026-05-20T21:14', no: 'TO-2605201' },
  { id: 'seed-osaka-kyoto', productId: 'seed', optionIndex: 0, tripId: 'osaka', date: '2026-06-13', time: '09:30', count: 1, price: 45000, seller: '오사카 로컬트립', title: '교토 반일 가이드 셔틀', planId: 'o5', paidAt: '2026-05-20T21:16', no: 'TO-2605202' },
  { id: 'seed-fukuoka-bus', productId: 'seed', optionIndex: 0, tripId: 'fukuoka', date: '2026-03-21', time: '09:00', count: 2, price: 39000, seller: '규슈 트래블', title: '유후인 · 벳푸 버스 투어', planId: 'f3', paidAt: '2026-02-28T13:02', no: 'TO-2602281' },
]

/** 최근 결제 순 */
export function allOrders(s: DemoState = state): ShopBooking[] {
  return [...SEED_ORDERS, ...(s.shopOrders ?? [])].sort((a, b) => (b.paidAt ?? '').localeCompare(a.paidAt ?? ''))
}

export function orderNo(order: ShopBooking) {
  return order.no ?? 'TO-' + order.id.slice(0, 8).toUpperCase()
}

export function orderStatus(order: ShopBooking, s: DemoState = state): OrderStatus {
  const change = s.orderChanges?.[order.id]
  if (change) return change.status
  return order.date < todayIso(s) ? 'used' : 'paid'
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = { paid: '결제 완료', used: '이용 완료', cancelled: '결제 취소', 'refund-requested': '환불 요청됨' }

/** 이용일 전날까지는 바로 결제 취소, 그 뒤엔 여행사에 환불 요청 */
export function canCancel(order: ShopBooking, s: DemoState = state) {
  return orderStatus(order, s) === 'paid' && order.date > todayIso(s)
}

export function cancelOrder(order: ShopBooking) {
  setDemoState({
    orderChanges: { ...state.orderChanges, [order.id]: { status: 'cancelled', at: new Date().toISOString() } },
    hiddenPlans: { ...state.hiddenPlans, [order.planId ?? 'shop-' + order.id]: true },
  })
}

export function requestRefund(order: ShopBooking, reason: string) {
  setDemoState({ orderChanges: { ...state.orderChanges, [order.id]: { status: 'refund-requested', at: new Date().toISOString(), reason } } })
}

/** 지난 여행: 끝난 날짜가 오늘보다 앞선 여행 (최근 순) */
export function pastTrips(s: DemoState = state): Trip[] {
  const today = todayIso(s)
  return [...PAST_TRIPS, ...allTrips(s).filter((t) => t.endIso < today)].sort((a, b) => b.endIso.localeCompare(a.endIso))
}

/* ------------------------------ 즐겨찾기 ------------------------------ */

export function toggleFavorite(productId: string) {
  const list = state.favorites ?? []
  setDemoState({ favorites: list.includes(productId) ? list.filter((id) => id !== productId) : [...list, productId] })
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
  const trip = findTrip(s.tripId, s) ?? TRIPS[0]
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
