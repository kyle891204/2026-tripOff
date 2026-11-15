import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { Badge, Field, HistoryDot, PartnerButton as Button, historyStamp, partnerStyles as p, useToast, useVoucherStore } from '@/features/partner'
import {
  PARTNER_DEMO_TODAY as DEMO_TODAY,
  STATUS_LABEL,
  type HistoryKey,
  type Voucher,
  type VoucherStatus,
} from '@/data/partnerVouchers'
import { cn } from '@/lib/cn'
import { DEMO_AGENCY_TRIP_ID, DEMO_DELIVERY_ID, syncDemoDelivery } from '@/data/demoDelivery'
import { pushDemoNotification } from '@/data/demoNotifications'
import s from './VoucherManagementPage.module.css'
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

const TABS: Array<{ key: 'all' | VoucherStatus; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: STATUS_LABEL.pending },
  { key: 'sent', label: STATUS_LABEL.sent },
  { key: 'used', label: STATUS_LABEL.used },
  { key: 'cancelled', label: STATUS_LABEL.cancelled },
]

const HISTORY_STEPS: Array<{ key: HistoryKey; label: string }> = [
  { key: 'issued', label: '바우처 발급' },
  { key: 'sent', label: '고객 지갑에 반영 (시연)' },
  { key: 'viewed', label: '고객 열람' },
  { key: 'used', label: '현장 사용' },
]

function shortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  return `${d.getMonth() + 1}.${d.getDate()} (${WEEKDAY[d.getDay()]})`
}

const stamp = historyStamp

export default function VoucherManagementPage() {
  const toast = useToast()
  const { vouchers, setVouchers } = useVoucherStore()
  const location = useLocation()
  const routeState = location.state as { selectId?: string; openScan?: boolean } | null
  const [tab, setTab] = useState<'all' | VoucherStatus>('all')
  const [query, setQuery] = useState('')
  const [date, setDate] = useState('')
  const [product, setProduct] = useState('')
  const [selectedId, setSelectedId] = useState<string>(routeState?.selectId ?? vouchers[0]?.id ?? '')
  const [scanOpen, setScanOpen] = useState(Boolean(routeState?.openScan))

  const counts = useMemo(() => {
    const c: Record<'all' | VoucherStatus, number> = { all: vouchers.length, pending: 0, sent: 0, used: 0, cancelled: 0 }
    vouchers.forEach((v) => (c[v.status] += 1))
    return c
  }, [vouchers])

  const todayCount = vouchers.filter((v) => v.date === DEMO_TODAY && v.status !== 'cancelled').length
  const products = useMemo(() => Array.from(new Set(vouchers.map((v) => v.product))), [vouchers])

  const visible = vouchers.filter((v) => {
    if (tab !== 'all' && v.status !== tab) return false
    const q = query.trim().toLowerCase()
    if (q && !v.customer.includes(q) && !v.id.toLowerCase().includes(q)) return false
    if (date && v.date !== date) return false
    if (product && v.product !== product) return false
    return true
  })

  const selected = vouchers.find((v) => v.id === selectedId) ?? null

  const patch = (id: string, fn: (v: Voucher) => Voucher) => setVouchers((prev) => prev.map((v) => (v.id === id ? fn(v) : v)))

  const markSent = (v: Voucher): Voucher => ({ ...v, status: 'sent', history: { ...v.history, sent: v.history.sent ?? stamp() } })

  const deliver = (v: Voucher, meeting = v.meeting) => {
    if (v.id !== DEMO_DELIVERY_ID) return true
    try {
      syncDemoDelivery({ id: v.id, title: v.product, date: v.date, time: v.option.match(/\d{2}:\d{2}/)?.[0] ?? '09:00', location: meeting, people: v.party })
      pushDemoNotification({
        title: v.status === 'pending' ? '여행 바우처가 도착했어요' : '여행 일정이 변경됐어요',
        body: `${v.product} · ${meeting}`,
        tripId: DEMO_AGENCY_TRIP_ID,
        planId: v.id,
      })
      return true
    } catch { toast.show('저장소에 접근할 수 없어 고객 지갑에 반영하지 못했어요.'); return false }
  }
  const bulkSend = () => {
    const pending = vouchers.filter(v => v.status === 'pending')
    if (!pending.length || !pending.every(v => deliver(v))) return
    setVouchers((prev) => prev.map((v) => (v.status === 'pending' ? markSent(v) : v)))
    toast.show(`시연 바우처 ${pending.length}건의 상태를 갱신했어요.`)
  }

  const checkIn = (id: string) => {
    const v = vouchers.find((x) => x.id === id)
    if (!v) return false
    if (v.status === 'pending') { toast.show('먼저 고객에게 발송해 주세요.'); return false }
    if (v.status === 'used') {
      toast.show(`${id}는 이미 사용 처리된 바우처예요.`)
      return false
    }
    if (v.status === 'cancelled') {
      toast.show(`${id}는 취소된 바우처라 사용할 수 없어요.`)
      return false
    }
    patch(id, (x) => ({ ...x, status: 'used', history: { ...x.history, sent: x.history.sent ?? stamp(), used: stamp() } }))
    setSelectedId(id)
    toast.show(`${v.customer}님 ${v.party} 체크인 완료`)
    return true
  }

  return (
    <main className={p.main}>
      <header className={p.header}>
        <div className={p.headerTitle}>
          <h1>바우처 관리</h1>
          <p className={p.desc}>발급된 바우처를 확인하고, 내용을 고치거나 현장에서 사용 처리하세요. 수정 내용은 고객 앱 일정에 바로 반영됩니다.</p>
        </div>
        <div className={p.actions}>
          <Button variant="secondary" onClick={() => setScanOpen(true)}>
            QR 스캔으로 사용 처리
          </Button>
          <Button variant="primary" onClick={bulkSend} disabled={counts.pending === 0}>
            발송 대기 일괄 발송
          </Button>
        </div>
      </header>

      <section className={s.summary} aria-label="바우처 요약">
        {[
          ['발송 대기', counts.pending],
          ['오늘 이용 예정', todayCount],
          ['발송 완료 (미사용)', counts.sent],
          ['취소', counts.cancelled],
        ].map(([label, n]) => (
          <div className={cn(p.card, s.summaryItem)} key={label}>
            <p className={s.summaryLabel}>{label}</p>
            <p className={s.summaryValue}>
              {n}
              <span> 건</span>
            </p>
          </div>
        ))}
      </section>

      <div className={p.body}>
        <section className={cn(p.card, s.list)} aria-label="바우처 목록">
          <div className={s.filters}>
            <div className={s.tabs} role="tablist" aria-label="상태">
              {TABS.map((t) => (
                <button key={t.key} role="tab" className={p.tab} aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
                  {`${t.label}  ${counts[t.key]}`}
                </button>
              ))}
            </div>
            <div className={cn(p.row, s.searchRow)}>
              <Field label="검색" htmlFor="v-q">
                <input id="v-q" className={p.input} type="search" placeholder="예약자명, 바우처 번호" value={query} onChange={(e) => setQuery(e.target.value)} />
              </Field>
              <Field label="이용일" htmlFor="v-date">
                <input id="v-date" className={p.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
              <Field label="상품" htmlFor="v-product">
                <select id="v-product" className={p.input} value={product} onChange={(e) => setProduct(e.target.value)}>
                  <option value="">전체 상품</option>
                  {products.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <table className={s.table}>
            <thead>
              <tr>
                <th style={{ width: 150 }}>바우처 번호</th>
                <th style={{ width: 90 }}>예약자</th>
                <th>상품 · 옵션</th>
                <th style={{ width: 100 }}>이용일</th>
                <th style={{ width: 110 }}>인원</th>
                <th style={{ width: 96 }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((v) => (
                <tr key={v.id} className={v.id === selectedId ? s.selected : undefined} onClick={() => setSelectedId(v.id)}>
                  <td>
                    <button className={s.link} onClick={() => setSelectedId(v.id)} aria-pressed={v.id === selectedId}>
                      {v.id}
                    </button>
                  </td>
                  <td>{v.customer}</td>
                  <td>
                    <span className={s.product}>{v.product}</span>
                    <span className={s.option}>{v.option}</span>
                  </td>
                  <td>{shortDate(v.date)}</td>
                  <td>{v.party}</td>
                  <td>
                    <Badge status={v.status} />
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr className={s.empty}>
                  <td colSpan={6}>조건에 맞는 바우처가 없어요.</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className={s.foot}>예시 데이터입니다. 김용태 바우처만 같은 브라우저의 시연용 여행 지갑에 반영되며, 실제 알림은 전송되지 않습니다.</p>
        </section>

        {selected && (
          <VoucherDetail
            key={selected.id}
            voucher={selected}
            onCheckIn={() => checkIn(selected.id)}
            onResend={(meeting) => {
              if (!deliver(selected, meeting)) return
              patch(selected.id, (v) => ({ ...markSent({ ...v, meeting }), history: { ...v.history, sent: stamp(), viewed: undefined } }))
              toast.show(selected.id === DEMO_DELIVERY_ID ? '시연 고객의 여행 지갑에 반영했어요.' : '시연용 발송 상태를 갱신했어요.')
            }}
            onCancel={() => {
              if (selected.id === DEMO_DELIVERY_ID) {
                try { syncDemoDelivery(null) } catch { toast.show('고객 지갑에서 취소 내용을 반영하지 못했어요.'); return }
              }
              patch(selected.id, (v) => ({ ...v, status: 'cancelled' }))
              toast.show(`${selected.id} 예약을 취소했어요.`)
            }}
          />
        )}
      </div>

      {scanOpen && (
        <ScanDialog
          onClose={() => setScanOpen(false)}
          onSubmit={(code) => {
            const id = code.trim().toUpperCase()
            if (!vouchers.some((v) => v.id === id)) {
              toast.show('일치하는 바우처가 없어요. 번호를 다시 확인해 주세요.')
              return
            }
            if (checkIn(id)) setScanOpen(false)
          }}
        />
      )}
      {toast.node}
    </main>
  )
}

type DetailProps = {
  voucher: Voucher
  onCheckIn: () => void
  onResend: (meeting: string) => void
  onCancel: () => void
}

function VoucherDetail({ voucher: v, onCheckIn, onResend, onCancel }: DetailProps) {
  const [meeting, setMeeting] = useState(v.meeting)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const closed = v.status === 'used' || v.status === 'cancelled'
  const changed = meeting.trim() !== v.meeting

  useEffect(() => setMeeting(v.meeting), [v.meeting])

  const rows: Array<[string, string]> = [
    ['예약자', `${v.customer} · ${v.phone}`],
    ['상품', v.product],
    ['옵션', v.option],
    ['이용일', `${shortDate(v.date)} · ${v.party}`],
    ['예약 경로', v.channel],
  ]

  return (
    <aside className={cn(p.card, s.detail)} aria-label="바우처 상세">
      <div className={s.detailHead}>
        <div>
          <p className={s.eyebrow}>바우처 상세</p>
          <p className={s.detailId}>{v.id}</p>
        </div>
        <Badge status={v.status} />
      </div>

      <dl className={s.rows}>
        {rows.map(([k, val]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{val}</dd>
          </div>
        ))}
      </dl>

      <Field label="집결 장소·시간" htmlFor="d-meet">
        <input id="d-meet" className={p.input} value={meeting} disabled={closed} onChange={(e) => setMeeting(e.target.value)} />
      </Field>
      <p className={p.hint}>김용태 시연 바우처는 수정 후 재발송하면 고객 여행 지갑에도 반영됩니다.</p>

      <div className={s.history}>
        <p className={p.label}>처리 이력</p>
        <ol>
          {HISTORY_STEPS.map((step) => {
            const at = v.history[step.key]
            return (
              <li key={step.key} className={at ? s.done : undefined}>
                <HistoryDot done={Boolean(at)} />
                <span className={s.historyLabel}>{step.label}</span>
                <span className={s.historyTime}>{at ?? '미완료'}</span>
              </li>
            )
          })}
          {v.status === 'cancelled' && (
            <li className={s.cancelledStep}>
              <HistoryDot done={false} />
              <span className={s.historyLabel}>예약 취소됨</span>
              <span className={s.historyTime} />
            </li>
          )}
        </ol>
      </div>

      <div className={s.detailActions}>
        <Button variant="primary" size="lg" block disabled={closed} onClick={onCheckIn}>
          {v.status === 'used' ? '사용 완료된 바우처' : '사용 처리 (체크인)'}
        </Button>
        <div className={s.secondaryActions}>
          <Button variant="secondary" disabled={closed || (!changed && v.status !== 'pending')} onClick={() => onResend(meeting.trim())}>
            {v.status === 'pending' && !changed ? '지금 발송' : '수정 후 재발송'}
          </Button>
          <Button
            variant="danger"
            disabled={closed}
            onClick={() => {
              if (!confirmCancel) {
                setConfirmCancel(true)
                return
              }
              onCancel()
            }}
            onBlur={() => setConfirmCancel(false)}
          >
            {confirmCancel ? '한 번 더 누르면 취소' : '예약 취소'}
          </Button>
        </div>
      </div>
    </aside>
  )
}

function ScanDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (code: string) => void }) {
  const [code, setCode] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={s.backdrop} onClick={onClose}>
      <form
        className={cn(s.dialog, p.card)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          if (code.trim()) onSubmit(code)
        }}
      >
        <h2 id="scan-title">QR 스캔으로 사용 처리</h2>
        <p className={p.hint}>스캐너로 고객 QR을 읽거나, 바우처 번호를 직접 입력하세요.</p>
        <Field label="바우처 번호" htmlFor="scan-code">
          <input id="scan-code" ref={inputRef} className={p.input} placeholder="예: TO-2611-0414" value={code} onChange={(e) => setCode(e.target.value)} />
        </Field>
        <div className={s.dialogActions}>
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
          <Button variant="primary" type="submit" disabled={!code.trim()}>
            사용 처리
          </Button>
        </div>
      </form>
    </div>
  )
}
