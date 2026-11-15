import { useNavigate } from 'react-router'
import {
  Badge,
  PartnerButton as Button,
  historyStamp,
  partnerStyles as p,
  useProductStore,
  useToast,
  useVoucherStore,
} from '@/features/partner'
import { PARTNER_COMPANY_NAME, PARTNER_DEMO_TODAY, type Voucher } from '@/data/partnerVouchers'
import { FEE_RATE, WEEKDAY, parseParty, priceOf, won } from '@/features/partner/calc'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/cn'
import s from './DashboardPage.module.css'

/** 출발 시각: 옵션명에 있으면 그 시각, 없으면 집결 시각 (예: '오전 출발 09:00' → '09:00') */
function timeOf(v: Voucher) {
  const pick = (text: string) => /(\d{1,2}:\d{2})/.exec(text)?.[1]
  return pick(v.option) ?? pick(v.meeting) ?? '종일'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { vouchers, setVouchers } = useVoucherStore()
  const { products } = useProductStore()

  const todayDate = new Date(`${PARTNER_DEMO_TODAY}T00:00:00`)
  const todayLabel = `${todayDate.getMonth() + 1}월 ${todayDate.getDate()}일 (${WEEKDAY[todayDate.getDay()]})`
  const month = PARTNER_DEMO_TODAY.slice(0, 7)

  const active = vouchers.filter((v) => v.status !== 'cancelled')
  const today = active
    .filter((v) => v.date === PARTNER_DEMO_TODAY)
    .sort((a, b) => timeOf(a).localeCompare(timeOf(b)))
  const todayPeople = today.reduce((sum, v) => sum + parseParty(v.party).total, 0)
  const pending = vouchers.filter((v) => v.status === 'pending')
  const monthBookings = active.filter((v) => v.date.startsWith(month))
  const cancelledThisMonth = vouchers.filter((v) => v.status === 'cancelled' && v.date.startsWith(month)).length
  const monthRevenue = monthBookings.reduce((sum, v) => sum + priceOf(v, products), 0)

  const bookingsByProduct = (name: string) => active.filter((v) => v.product === name).length

  const openVoucher = (id: string) => navigate(ROUTES.partnerVouchers, { state: { selectId: id } })

  const checkIn = (v: Voucher) => {
    setVouchers((prev) =>
      prev.map((x) =>
        x.id === v.id ? { ...x, status: 'used', history: { ...x.history, sent: x.history.sent ?? historyStamp(), used: historyStamp() } } : x,
      ),
    )
    toast.show(`${v.customer}님 ${v.party} 체크인 완료`)
  }

  const sendAll = () => {
    const n = pending.length
    setVouchers((prev) =>
      prev.map((x) => (x.status === 'pending' ? { ...x, status: 'sent', history: { ...x.history, sent: historyStamp() } } : x)),
    )
    toast.show(`발송 대기 ${n}건을 고객에게 보냈어요.`)
  }

  const stats = [
    {
      label: '오늘 이용 예정',
      value: today.length,
      unit: '건',
      sub: today.length ? `총 ${todayPeople}명 방문 예정` : '오늘은 예약이 없어요',
      onClick: () => document.getElementById('today')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      label: '발송 대기 바우처',
      value: pending.length,
      unit: '건',
      sub: pending.length ? '고객이 아직 바우처를 못 받았어요' : '모두 발송했어요',
      alert: pending.length > 0,
      onClick: () => navigate(ROUTES.partnerVouchers),
    },
    {
      label: `${todayDate.getMonth() + 1}월 예약`,
      value: monthBookings.length,
      unit: '건',
      sub: cancelledThisMonth ? `취소 ${cancelledThisMonth}건 제외` : '취소 없음',
      onClick: () => navigate(ROUTES.partnerVouchers),
    },
    {
      label: `${todayDate.getMonth() + 1}월 예상 정산`,
      value: won(monthRevenue * (1 - FEE_RATE)),
      unit: '',
      sub: `판매액 ${won(monthRevenue)} · 수수료 ${FEE_RATE * 100}% 제외`,
      onClick: undefined,
    },
  ]

  return (
    <main className={p.main}>
      <header className={p.header}>
        <div className={p.headerTitle}>
          <p className={p.crumb}>{todayLabel} 기준</p>
          <h1>안녕하세요, {PARTNER_COMPANY_NAME}님</h1>
          <p className={p.desc}>오늘 처리할 예약과 바우처를 한눈에 확인하세요.</p>
        </div>
        <div className={p.actions}>
          <Button variant="secondary" onClick={() => navigate(ROUTES.partnerVouchers, { state: { openScan: true } })}>
            QR 스캔으로 사용 처리
          </Button>
          <Button variant="primary" onClick={() => navigate(ROUTES.partnerProductNew)}>
            + 새 상품 등록
          </Button>
        </div>
      </header>

      <section className={s.stats} aria-label="요약">
        {stats.map((st) =>
          st.onClick ? (
            <button key={st.label} type="button" className={cn(p.card, s.stat)} onClick={st.onClick}>
              <StatBody {...st} />
            </button>
          ) : (
            <div key={st.label} className={cn(p.card, s.stat)} style={{ cursor: 'default' }}>
              <StatBody {...st} />
            </div>
          ),
        )}
      </section>

      <div className={s.grid}>
        <div className={s.col}>
          <section id="today" className={cn(p.card, s.panel)} aria-labelledby="today-title">
            <div className={s.panelHead}>
              <div>
                <h2 id="today-title">오늘 체크인</h2>
                <p>집결 시간이 빠른 순서예요. 현장에서 바로 체크인할 수 있어요.</p>
              </div>
              <button type="button" className={s.more} onClick={() => navigate(ROUTES.partnerVouchers)}>
                바우처 관리 →
              </button>
            </div>
            {today.length ? (
              <ul className={s.rows}>
                {today.map((v) => (
                  <li key={v.id} className={s.row} onClick={() => openVoucher(v.id)}>
                    <span className={s.time}>{timeOf(v)}</span>
                    <span className={s.who}>
                      <strong>
                        {v.customer} · {v.party}
                      </strong>
                      <span>
                        {v.product} · {v.option}
                      </span>
                    </span>
                    <Badge status={v.status} />
                    {v.status === 'used' ? (
                      <span style={{ width: 66 }} />
                    ) : (
                      <Button
                        variant="primary"
                        className={s.smallBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          checkIn(v)
                        }}
                      >
                        체크인
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={s.empty}>오늘 이용 예정인 예약이 없어요.</p>
            )}
          </section>

          <section className={cn(p.card, s.panel)} aria-labelledby="pending-title">
            <div className={s.panelHead}>
              <div>
                <h2 id="pending-title">발송 대기 바우처</h2>
                <p>보내면 고객 앱 일정에 바우처가 바로 들어가요.</p>
              </div>
              <Button variant="outline" className={s.smallBtn} disabled={!pending.length} onClick={sendAll}>
                모두 발송
              </Button>
            </div>
            {pending.length ? (
              <ul className={s.rows}>
                {pending.map((v) => (
                  <li key={v.id} className={cn(s.row, s.pendingRow)} onClick={() => openVoucher(v.id)}>
                    <span className={s.who}>
                      <strong>
                        {v.customer} · {v.party}
                      </strong>
                      <span>
                        {v.date.slice(5).replace('-', '.')} 이용 · {v.product} · {v.option}
                      </span>
                    </span>
                    <Badge status={v.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={s.empty}>보낼 바우처가 없어요. 모두 발송했어요.</p>
            )}
          </section>
        </div>

        <section className={cn(p.card, s.panel)} aria-labelledby="products-title">
          <div className={s.panelHead}>
            <div>
              <h2 id="products-title">판매 중인 상품</h2>
              <p>{products.length}개 상품 · 예약 많은 순</p>
            </div>
            <button type="button" className={s.more} onClick={() => navigate(ROUTES.partnerProducts)}>
              상품 관리 →
            </button>
          </div>
          <ul className={s.products}>
            {[...products]
              .sort((a, b) => bookingsByProduct(b.name) - bookingsByProduct(a.name))
              .map((product) => {
                const n = bookingsByProduct(product.name)
                return (
                  <li key={product.id} className={s.product}>
                    <span className={s.productText}>
                      <strong>{product.name}</strong>
                      <span>
                        {product.region} · {product.options.length}개 옵션
                      </span>
                    </span>
                    {n ? (
                      <span className={s.bookings}>
                        <strong>{n}건</strong>
                        <span>예약</span>
                      </span>
                    ) : (
                      <span className={s.noBookings}>아직 예약 없음</span>
                    )}
                  </li>
                )
              })}
          </ul>
        </section>
      </div>
      {toast.node}
    </main>
  )
}

function StatBody({ label, value, unit, sub, alert }: { label: string; value: number | string; unit: string; sub: string; alert?: boolean }) {
  return (
    <>
      <span className={s.statLabel}>{label}</span>
      <span className={s.statValue}>
        {value}
        {unit && <span> {unit}</span>}
      </span>
      <span className={cn(s.statSub, alert && s.statAlert)}>{sub}</span>
    </>
  )
}
