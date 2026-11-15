import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Badge, partnerStyles as p, useVoucherStore } from '@/features/partner'
import { PARTNER_DEMO_TODAY, type Voucher, type VoucherStatus } from '@/data/partnerVouchers'
import { WEEKDAY, parseParty } from '@/features/partner/calc'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/cn'
import s from './ReservationsPage.module.css'

type Filter = 'all' | 'upcoming' | 'done' | 'cancelled'

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'upcoming', label: '이용 예정' },
  { key: 'done', label: '이용 완료' },
  { key: 'cancelled', label: '취소' },
]

function timeOf(v: Voucher) {
  const pick = (t: string) => /(\d{1,2}:\d{2})/.exec(t)?.[1]
  return pick(v.option) ?? pick(v.meeting) ?? '종일'
}

function matches(v: Voucher, filter: Filter) {
  if (filter === 'all') return true
  if (filter === 'cancelled') return v.status === 'cancelled'
  if (filter === 'done') return v.status === 'used'
  // upcoming: 취소·사용 완료가 아닌 예약
  return v.status === 'pending' || v.status === 'sent'
}

export default function ReservationsPage() {
  const navigate = useNavigate()
  const { vouchers } = useVoucherStore()
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: vouchers.length, upcoming: 0, done: 0, cancelled: 0 }
    vouchers.forEach((v) => {
      if (v.status === 'cancelled') c.cancelled += 1
      else if (v.status === 'used') c.done += 1
      else c.upcoming += 1
    })
    return c
  }, [vouchers])

  const active = vouchers.filter((v) => v.status !== 'cancelled')
  const upcoming = active.filter((v) => v.date >= PARTNER_DEMO_TODAY).length
  const people = active.filter((v) => v.date >= PARTNER_DEMO_TODAY).reduce((n, v) => n + parseParty(v.party).total, 0)

  const groups = useMemo(() => {
    const filtered = vouchers.filter((v) => matches(v, filter))
    const byDate = new Map<string, Voucher[]>()
    filtered.forEach((v) => {
      const list = byDate.get(v.date) ?? []
      list.push(v)
      byDate.set(v.date, list)
    })
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, list]) => ({
        date,
        list: list.sort((a, b) => timeOf(a).localeCompare(timeOf(b))),
      }))
  }, [vouchers, filter])

  const openVoucher = (id: string) => navigate(ROUTES.partnerVouchers, { state: { selectId: id } })

  return (
    <main className={p.main}>
      <header className={p.header}>
        <div className={p.headerTitle}>
          <h1>예약 현황</h1>
          <p className={p.desc}>날짜별로 들어온 예약을 확인하세요. 예약을 누르면 바우처 상세로 이동합니다.</p>
        </div>
      </header>

      <section className={s.summary} aria-label="예약 요약">
        <div className={cn(p.card, s.summaryItem)}>
          <span className={s.summaryLabel}>다가오는 예약</span>
          <span className={s.summaryValue}>
            {upcoming}
            <span> 건</span>
          </span>
        </div>
        <div className={cn(p.card, s.summaryItem)}>
          <span className={s.summaryLabel}>예정 방문 인원</span>
          <span className={s.summaryValue}>
            {people}
            <span> 명</span>
          </span>
        </div>
        <div className={cn(p.card, s.summaryItem)}>
          <span className={s.summaryLabel}>누적 예약</span>
          <span className={s.summaryValue}>
            {counts.all}
            <span> 건</span>
          </span>
        </div>
        <div className={cn(p.card, s.summaryItem)}>
          <span className={s.summaryLabel}>취소</span>
          <span className={s.summaryValue}>
            {counts.cancelled}
            <span> 건</span>
          </span>
        </div>
      </section>

      <div className={s.tabs} role="tablist" aria-label="예약 상태">
        {FILTERS.map((f) => (
          <button key={f.key} role="tab" className={p.tab} aria-selected={filter === f.key} onClick={() => setFilter(f.key)}>
            {`${f.label}  ${counts[f.key]}`}
          </button>
        ))}
      </div>

      {groups.length ? (
        <div className={s.groups}>
          {groups.map(({ date, list }) => {
            const d = new Date(`${date}T00:00:00`)
            const total = list.filter((v) => v.status !== 'cancelled').reduce((n, v) => n + parseParty(v.party).total, 0)
            return (
              <section key={date} className={cn(p.card, s.group)}>
                <div className={s.groupHead}>
                  <span className={s.groupDate}>
                    {d.getMonth() + 1}월 {d.getDate()}일 ({WEEKDAY[d.getDay()]})
                  </span>
                  {date === PARTNER_DEMO_TODAY && <span className={s.groupToday}>오늘</span>}
                  <span className={s.groupMeta}>
                    예약 {list.length}건 · {total}명
                  </span>
                </div>
                <ul className={s.rows}>
                  {list.map((v) => (
                    <li
                      key={v.id}
                      className={cn(s.row, v.status === 'cancelled' && s.cancelled)}
                      onClick={() => openVoucher(v.id)}
                    >
                      <span className={s.time}>{timeOf(v)}</span>
                      <span className={s.who}>
                        <strong>{v.customer}</strong>
                        <span>
                          {v.product} · {v.option}
                        </span>
                      </span>
                      <span className={s.party}>{v.party}</span>
                      <Badge status={v.status as VoucherStatus} />
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      ) : (
        <div className={cn(p.card, s.empty)}>해당하는 예약이 없어요.</div>
      )}
    </main>
  )
}
