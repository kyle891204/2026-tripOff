import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { PARTNER_SAMPLE_VOUCHERS, type Voucher } from '@/data/partnerVouchers'

/** 대시보드와 바우처 관리가 같은 데이터를 보도록 레이아웃에서 한 번만 들고 있는다. */
const STORAGE_KEY = 'tripoff.partner.vouchers'

interface VoucherStore {
  vouchers: Voucher[]
  setVouchers: Dispatch<SetStateAction<Voucher[]>>
}

export const VoucherStoreContext = createContext<VoucherStore | null>(null)

function load(): Voucher[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
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

export function useVoucherStoreValue(): VoucherStore {
  const [vouchers, setVouchers] = useState<Voucher[]>(load)
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(vouchers))
    } catch {
      // 저장 실패는 시연에 영향 없음
    }
  }, [vouchers])
  return useMemo(() => ({ vouchers, setVouchers }), [vouchers])
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
