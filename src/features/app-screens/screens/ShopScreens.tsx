import { useState, type ReactNode } from 'react'
import { loadPartnerProducts } from '@/features/partner/productStore'
import { loadPartnerCompany } from '@/features/partner/companyStore'
import { won } from '@/features/partner/calc'
import type { PartnerProduct } from '@/data/partnerProducts'
import Screen from '../parts/Screen'
import PlanIcon from '../parts/PlanIcon'
import { IconBack } from '../parts/icons'
import { dateAt, type Plan } from '../mock'
import { allTrips, getDemoState, setDemoState, useCurrentTrip, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import s from './ShopScreens.module.css'

function Page({ title, back, children }: { title: string; back: () => void; children: ReactNode }) {
  return <Screen bg="var(--mist)" label={title}>
    <header className={s.header}><button aria-label="뒤로" onClick={back}><IconBack /></button><h1>{title}</h1><span /></header>
    <div className={s.body}>{children}</div>
  </Screen>
}

function bookable(option: PartnerProduct['options'][number]) {
  return Number(option.stock) > 0 && Number(option.adult) > 0
}

function remaining(product: PartnerProduct, optionIndex: number, date: string) {
  const used = (getDemoState().shopOrders ?? []).filter(order =>
    order.productId === product.id && order.optionIndex === optionIndex && order.date === date
  ).reduce((sum, order) => sum + order.count, 0)
  return Math.max(0, Number(product.options[optionIndex]?.stock ?? 0) - used)
}

export function ShopScreen({ go, back }: ScreenProps) {
  const trip = useCurrentTrip()
  const [products] = useState(loadPartnerProducts)
  const [seller] = useState(() => loadPartnerCompany().name)
  const [query, setQuery] = useState('')
  const sorted = [...products].sort((a, b) => Number(b.region.includes(trip.name)) - Number(a.region.includes(trip.name)))
  const visible = sorted.filter(p => (p.name + p.region + p.category).includes(query.trim()))
  return <Page title="여행 상점" back={back}>
    <div className={s.hero}><p>{trip.name} 여행에 더해볼까요?</p><h2>한 번의 예약으로<br />일정과 바우처까지.</h2><span>여행사가 등록한 투어와 액티비티를 만나보세요.</span></div>
    <label className={s.search}>상품 검색<input value={query} onChange={e => setQuery(e.target.value)} placeholder="상품명 또는 지역" /></label>
    <div className={s.section}><h2>추천 상품</h2><span>{visible.length}개</span></div>
    {visible.map(product => {
      const options = product.options.filter(bookable)
      return <button className={s.product} key={product.id} disabled={!options.length} onClick={() => {
        setDemoState({ shopProductId: product.id, shopBooking: undefined })
        go('shop-product')
      }}>
        <div className={s.art}><PlanIcon kind="ticket" /><span>{product.category}</span></div>
        <div className={s.productCopy}><small>{seller} · {product.region}</small><h3>{product.name}</h3>
          <p>{product.duration}</p><strong>{options.length ? won(Math.min(...options.map(o => Number(o.adult)))) + '부터' : '매진'}</strong></div>
      </button>
    })}
    {!visible.length && <p className={s.notice}>검색한 상품이 없어요. 다른 지역이나 상품명을 입력해 주세요.</p>}
  </Page>
}

export function ShopProductScreen({ go, back }: ScreenProps) {
  const trip = useCurrentTrip()
  const state = useDemoState()
  const [products] = useState(loadPartnerProducts)
  const product = products.find(p => p.id === state.shopProductId)
  const [optionIndex, setOptionIndex] = useState(() => Math.max(0, product?.options.findIndex(bookable) ?? 0))
  const [time, setTime] = useState(() => product?.options.find(bookable)?.name.match(/\d{2}:\d{2}/)?.[0] ?? '09:00')
  const [date, setDate] = useState(dateAt(trip, Math.min(state.dayIndex, trip.days.length - 1)))
  const [count, setCount] = useState(1)
  const [seller] = useState(() => loadPartnerCompany().name)
  if (!product) return <Page title="상품 상세" back={back}><p className={s.notice}>상점에서 상품을 선택해 주세요.</p><button className={s.cta} onClick={() => go('shop')}>상점으로</button></Page>
  const option = product.options[optionIndex]
  const stock = remaining(product, optionIndex, date)
  const weekday = '일월화수목금토'[new Date(date + 'T00:00:00Z').getUTCDay()]
  const valid = !!option && bookable(option) && count > 0 && Number.isInteger(count) && count <= stock &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(time) && date >= trip.startIso && date <= trip.endIso && product.days.includes(weekday)
  const submit = () => {
    if (!valid) return
    setDemoState({ shopBooking: {
      id: crypto.randomUUID(), productId: product.id, optionIndex, tripId: trip.id,
      date, time, count, price: Number(option.adult), seller, title: product.name,
    } })
    go('shop-checkout')
  }
  return <Page title="상품 상세" back={back}>
    <div className={s.detailArt}><PlanIcon kind="ticket" /><span>{product.category}</span></div>
    <p className={s.seller}>{seller} · {product.region}</p><h2 className={s.title}>{product.name}</h2>
    <p className={s.notice}>{product.duration} · 운영 {product.days.join('·')}</p>
    <div className={s.panel}><h3>이용 안내</h3><p>집결 장소 · {product.meetPlace || '예약 후 안내'}</p>
      <p>예약 완료 후 선택한 여행에 바우처가 저장됩니다.</p></div>
    <div className={s.panel}>
      <label>옵션<select value={optionIndex} onChange={e => {
        const index = Number(e.target.value)
        setOptionIndex(index)
        setTime(product.options[index].name.match(/\d{2}:\d{2}/)?.[0] ?? '09:00')
      }}>
        {product.options.map((o, i) => <option key={i} value={i} disabled={!bookable(o)}>{o.name} · {won(Number(o.adult))}</option>)}
      </select></label>
      <label>이용일<input type="date" min={trip.startIso} max={trip.endIso} value={date} onChange={e => setDate(e.target.value)} /></label>
      <label>이용 시간<input type="time" value={time} onChange={e => setTime(e.target.value)} /></label>
      <label>성인 인원<input type="number" min="1" max={stock} value={count} onChange={e => setCount(Number(e.target.value))} /></label>
      <p>{trip.name} · {trip.startIso} ~ {trip.endIso}<br />선택일 잔여 {stock}명</p>
      {!valid && <p role="status">여행 기간과 운영 요일에 맞는 날짜, 옵션, 잔여 인원을 확인해 주세요.</p>}
    </div>
    <div className={s.total}><span>총 상품 금액</span><strong>{won(Number(option?.adult ?? 0) * count)}</strong></div>
    <button className={s.cta} disabled={!valid} onClick={submit}>예약·결제하기</button>
  </Page>
}

export function ShopCheckoutScreen({ go, back }: ScreenProps) {
  const state = useDemoState()
  const booking = state.shopBooking
  const [error, setError] = useState('')
  const done = !!booking && (state.shopOrders ?? []).some(order => order.id === booking.id)
  const confirm = () => {
    if (!booking) return
    const latest = getDemoState()
    if ((latest.shopOrders ?? []).some(order => order.id === booking.id)) return
    const product = loadPartnerProducts().find(p => p.id === booking.productId)
    const trip = allTrips(latest).find(t => t.id === booking.tripId)
    const option = product?.options[booking.optionIndex]
    if (!product || !trip || !option || Number(option.adult) !== booking.price || remaining(product, booking.optionIndex, booking.date) < booking.count) {
      setError('상품 가격이나 잔여 인원이 변경됐어요. 상품 상세에서 다시 선택해 주세요.')
      return
    }
    const day = Math.round((Date.parse(booking.date) - Date.parse(trip.startIso)) / 86400000)
    const plan: Plan = {
      id: 'shop-' + booking.id, day, time: booking.time,
      title: booking.title, icon: 'ticket', source: { kind: 'agency', name: booking.seller },
      location: product.meetPlace, note: option.name, people: '성인 ' + booking.count + '명',
      code: 'TO-' + booking.id.slice(0, 8).toUpperCase(), qrValue: 'tripoff-demo:' + booking.id,
    }
    setDemoState({
      shopOrders: [...(latest.shopOrders ?? []), booking],
      addedPlans: { ...latest.addedPlans, [trip.id]: [...(latest.addedPlans[trip.id] ?? []), plan] },
      tripId: trip.id, dayIndex: day, planId: plan.id,
    })
  }
  if (!booking) return <Page title="예약·결제" back={back}><p className={s.notice}>먼저 상품과 이용일을 선택해 주세요.</p><button className={s.cta} onClick={() => go('shop')}>상품 둘러보기</button></Page>
  return <Page title={done ? '예약 완료' : '예약·결제'} back={back}>
    {done && <div className={s.hero}><p>바우처가 여행에 저장됐어요</p><h2>예약이 완료됐어요.</h2><span>일정에서 티켓을 바로 확인해 보세요.</span></div>}
    <div className={s.panel}><small>{booking.seller}</small><h2>{booking.title}</h2><p>{booking.date} {booking.time} · 성인 {booking.count}명</p>
      <p>{loadPartnerProducts().find(p => p.id === booking.productId)?.options[booking.optionIndex]?.name}</p></div>
    <div className={s.panel}><h3>결제 금액</h3><div className={s.total}><span>{won(booking.price)} × {booking.count}명</span><strong>{won(booking.price * booking.count)}</strong></div>
      <p>결제 수단 · 시연용 카드<br />실제 금액이 청구되지 않는 체험 결제입니다.</p></div>
    {error && <p role="alert" className={s.error}>{error}</p>}
    {done ? <><button className={s.cta} onClick={() => go('timeline')}>내 일정에서 확인</button>
      <button className={s.secondary} onClick={() => go('plan')}>바우처 열기</button></>
      : <button className={s.cta} onClick={confirm}>{won(booking.price * booking.count)} 시연 결제</button>}
  </Page>
}
