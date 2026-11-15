import type { Voucher } from '@/data/partnerVouchers'
import type { PartnerProduct } from '@/data/partnerProducts'

/** 플랫폼 중개 수수료 (시연용 가정). 실제 계약 수수료로 교체한다. */
export const FEE_RATE = 0.1

export const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

/** '성인 2 · 아동 1' → { adults: 2, children: 1, total: 3 } */
export function parseParty(party: string) {
  const adults = Number(/성인\s*(\d+)/.exec(party)?.[1] ?? 0)
  const children = Number(/아동\s*(\d+)/.exec(party)?.[1] ?? 0)
  return { adults, children, total: adults + children }
}

/** 상품·옵션 가격과 인원으로 바우처 1건의 판매액을 구한다. */
export function priceOf(v: Voucher, products: PartnerProduct[]) {
  const option = products.find((x) => x.name === v.product)?.options.find((o) => o.name === v.option)
  if (!option) return 0
  const { adults, children } = parseParty(v.party)
  const adult = Number(option.adult) || 0
  const child = Number(option.child) || adult
  return adult * adults + child * children
}

export function won(n: number) {
  return `₩${Math.round(n).toLocaleString('ko-KR')}`
}

/** 'YYYY-MM-DD' → 'M.D (요일)' */
export function dateLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return `${d.getMonth() + 1}.${d.getDate()} (${WEEKDAY[d.getDay()]})`
}
