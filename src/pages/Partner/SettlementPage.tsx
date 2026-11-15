import { useMemo } from 'react'
import { partnerStyles as p, useProductStore, useVoucherStore } from '@/features/partner'
import { PARTNER_DEMO_TODAY } from '@/data/partnerVouchers'
import { FEE_RATE, priceOf, won } from '@/features/partner/calc'
import { cn } from '@/lib/cn'
import s from './SettlementPage.module.css'

/** 지난 정산 내역 (시연용 목업). 실제로는 정산 API에서 불러온다. */
const PAST_SETTLEMENTS = [
  { month: '2026-10', sales: 4820000, payout: 4338000, paidAt: '11.15 지급 완료', paid: true },
  { month: '2026-09', sales: 3960000, payout: 3564000, paidAt: '10.15 지급 완료', paid: true },
  { month: '2026-08', sales: 5210000, payout: 4689000, paidAt: '09.15 지급 완료', paid: true },
]

export default function SettlementPage() {
  const { vouchers } = useVoucherStore()
  const { products } = useProductStore()

  const todayDate = new Date(`${PARTNER_DEMO_TODAY}T00:00:00`)
  const monthNo = todayDate.getMonth() + 1
  const month = PARTNER_DEMO_TODAY.slice(0, 7)

  // 이번 달 정산 대상: 취소를 제외한 이번 달 예약
  const monthVouchers = vouchers.filter((v) => v.status !== 'cancelled' && v.date.startsWith(month))
  const sales = monthVouchers.reduce((sum, v) => sum + priceOf(v, products), 0)
  const fee = sales * FEE_RATE
  const payout = sales - fee

  const byProduct = useMemo(() => {
    const map = new Map<string, { count: number; sales: number }>()
    monthVouchers.forEach((v) => {
      const cur = map.get(v.product) ?? { count: 0, sales: 0 }
      cur.count += 1
      cur.sales += priceOf(v, products)
      map.set(v.product, cur)
    })
    return [...map.entries()]
      .map(([name, x]) => ({ name, ...x, payout: x.sales * (1 - FEE_RATE) }))
      .sort((a, b) => b.sales - a.sales)
  }, [monthVouchers, products])

  return (
    <main className={p.main}>
      <header className={p.header}>
        <div className={p.headerTitle}>
          <h1>정산</h1>
          <p className={p.desc}>이용 완료·예정 예약을 기준으로 이번 달 정산 예정 금액을 계산합니다.</p>
        </div>
      </header>

      <section className={cn(p.card, s.hero)} aria-label={`${monthNo}월 정산 요약`}>
        <div className={s.heroMain}>
          <p className={s.heroLabel}>{monthNo}월 정산 예정 금액</p>
          <p className={s.heroValue}>{won(payout)}</p>
          <p className={s.heroSchedule}>매월 15일에 전월 정산금이 등록된 계좌로 지급됩니다 · 다음 지급 예정일 {monthNo + 1}월 15일</p>
        </div>
        <div className={s.breakdown}>
          <div className={s.breakdownRow}>
            <span>판매액</span>
            <strong>{won(sales)}</strong>
          </div>
          <div className={s.breakdownRow}>
            <span>플랫폼 수수료 ({FEE_RATE * 100}%)</span>
            <strong className={s.minus}>-{won(fee)}</strong>
          </div>
          <div className={s.breakdownRow}>
            <span>환불 차감</span>
            <strong className={s.minus}>-{won(0)}</strong>
          </div>
          <div className={cn(s.breakdownRow, s.breakdownTotal)}>
            <span>실지급 예정액</span>
            <strong>{won(payout)}</strong>
          </div>
        </div>
      </section>

      <section className={cn(p.card, s.panel)} aria-labelledby="by-product">
        <div className={s.panelHead}>
          <h2 id="by-product">{monthNo}월 상품별 정산</h2>
          <p>이번 달 예약 {monthVouchers.length}건 기준</p>
        </div>
        <table className={s.table}>
          <thead>
            <tr>
              <th>상품</th>
              <th>예약</th>
              <th>판매액</th>
              <th>수수료</th>
              <th>정산액</th>
            </tr>
          </thead>
          <tbody>
            {byProduct.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.count}건</td>
                <td>{won(row.sales)}</td>
                <td className={s.minus}>-{won(row.sales * FEE_RATE)}</td>
                <td className={s.payout}>{won(row.payout)}</td>
              </tr>
            ))}
            {byProduct.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--p-text-sub)', padding: '32px' }}>
                  이번 달 정산 대상 예약이 없어요.
                </td>
              </tr>
            )}
          </tbody>
          {byProduct.length > 0 && (
            <tfoot>
              <tr className={s.foot}>
                <td>합계</td>
                <td>{monthVouchers.length}건</td>
                <td>{won(sales)}</td>
                <td className={s.minus}>-{won(fee)}</td>
                <td>{won(payout)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </section>

      <section className={cn(p.card, s.panel)} aria-labelledby="past">
        <div className={s.panelHead}>
          <h2 id="past">지난 정산 내역</h2>
          <p>예시 데이터입니다. 실제 화면에서는 지급 내역과 연동됩니다.</p>
        </div>
        <table className={s.table}>
          <thead>
            <tr>
              <th>정산 월</th>
              <th>판매액</th>
              <th>정산액</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {monthNo}월
                <span className={s.sub}>{monthNo + 1}월 15일 지급 예정</span>
              </td>
              <td>{won(sales)}</td>
              <td className={s.payout}>{won(payout)}</td>
              <td>
                <span className={s.statusScheduled}>지급 예정</span>
              </td>
            </tr>
            {PAST_SETTLEMENTS.map((row) => {
              const m = Number(row.month.slice(5))
              return (
                <tr key={row.month}>
                  <td>
                    {m}월<span className={s.sub}>{row.paidAt}</span>
                  </td>
                  <td>{won(row.sales)}</td>
                  <td className={s.payout}>{won(row.payout)}</td>
                  <td>
                    <span className={s.statusPaid}>지급 완료</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <p className={s.note}>※ 수수료율과 지급 일정은 시연용 가정값입니다. 실제 정산은 제휴 계약 조건에 따릅니다.</p>
    </main>
  )
}
