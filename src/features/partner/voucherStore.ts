import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type Dispatch, type SetStateAction } from 'react'
import { PARTNER_SAMPLE_VOUCHERS, type Voucher } from '@/data/partnerVouchers'

/**
 * 대시보드·바우처 관리·고객 앱 상점이 같은 데이터를 보도록 모듈 단위 저장소로 둔다.
 * 상점에서 파트너 상품을 결제하면 여기에 「발송 대기」 바우처가 생긴다.
 */
const STORAGE_KEY = 'tripoff.partner.vouchers'

interface VoucherStore {
  vouchers: Voucher[]
  setVouchers: Dispatch<SetStateAction<Voucher[]>>
}

export const VoucherStoreContext = createContext<VoucherStore | null>(null)

function read(): Voucher[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const current: unknown = JSON.parse(raw)
      if (Array.isArray(current)) {
        const demo = PARTNER_SAMPLE_VOUCHERS[0]
        return current.some(v => v?.id === demo.id) ? current : [demo, ...current]
      }
    }
  } catch {
    // 저장소를 못 쓰는 환경이면 예시 데이터로 시작
  }
  return PARTNER_SAMPLE_VOUCHERS
}

let vouchers = read()
const listeners = new Set<() => void>()

function publish(next: Voucher[]) {
  vouchers = next
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* 열린 탭의 상태는 유지 */ }
  listeners.forEach(listener => listener())
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return
  vouchers = read()
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (!listeners.size) window.removeEventListener('storage', onStorage)
  }
}

const snapshot = () => vouchers

export function setPartnerVouchers(action: SetStateAction<Voucher[]>) {
  publish(typeof action === 'function' ? action(vouchers) : action)
}

/** 고객이 상점에서 결제하면 여행사 쪽에 「발송 대기」 바우처를 만든다. */
export function addPartnerVoucher(voucher: Voucher) {
  if (vouchers.some(v => v.id === voucher.id)) return
  publish([voucher, ...vouchers])
}

export function resetPartnerVouchers() {
  publish(PARTNER_SAMPLE_VOUCHERS)
}

export function usePartnerVouchers() {
  return useSyncExternalStore(subscribe, snapshot)
}

export function useVoucherStoreValue(): VoucherStore {
  const current = usePartnerVouchers()
  const setVouchers = useCallback<Dispatch<SetStateAction<Voucher[]>>>(action => setPartnerVouchers(action), [])
  return useMemo(() => ({ vouchers: current, setVouchers }), [current, setVouchers])
}

export function useVoucherStore(): VoucherStore {
  const store = useContext(VoucherStoreContext)
  if (!store) throw new Error('useVoucherStore는 PartnerLayout 안에서만 쓸 수 있어요.')
  return store
}

/** 발송 시각 표기 (예: 11.16 14:05) */
export function historyStamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}.${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
