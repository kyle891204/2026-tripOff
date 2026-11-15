import { fileRecord } from '../voucherFiles'
import { SHOP_COUNTRIES, countryOf, countryImage } from '@/data/shopCountries'
import { useEffect, useState, type ReactNode } from 'react'
import { won } from '@/features/partner/calc'
import type { PartnerProduct } from '@/data/partnerProducts'
import Screen from '../parts/Screen'
import TabBar from '../parts/TabBar'
import { destinationOf, loadShopProducts, useShopProducts } from '../shopCatalog'
import { IconBack } from '../parts/icons'
import { dateAt, type Plan } from '../mock'
import { allTrips, getDemoState, setDemoState, useCurrentTrip, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import s from './ShopScreens.module.css'

function Page({ title, back, children, tabGo }: { title: string; back: () => void; children: ReactNode; tabGo?: ScreenProps['go'] }) {
  return <Screen bg="var(--mist)" label={title}>
    <header className={s.header}>{tabGo ? <span /> : <button aria-label="뒤로" onClick={back}><IconBack /></button>}<h1>{title}</h1><span /></header>
    <div className={s.body} style={tabGo ? { bottom: 84 } : undefined}>{children}</div>
    {tabGo && <TabBar active="shop" go={tabGo} />}
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

const PROMOS = SHOP_COUNTRIES.map(country => ({
  destination: country.cities[0], image: countryImage(country.name),
  label: country.name + '에서 만나는 새로운 하루',
  title: country.cities[0] + ' 투어 · 액티비티',
}))


function ShopPhoto({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [local, setLocal] = useState<{ source: string; url: string }>()
  const [failedSource, setFailedSource] = useState('')
  const stored = src.startsWith('indexeddb:')
  useEffect(() => {
    if (!stored) return
    let disposed = false
    let url: string | undefined
    void fileRecord(src.slice('indexeddb:'.length)).then(file => {
      if (disposed) return
      if (!file) { setFailedSource(src); return }
      url = URL.createObjectURL(file)
      setLocal({ source: src, url })
    }).catch(() => { if (!disposed) setFailedSource(src) })
    return () => { disposed = true; if (url) URL.revokeObjectURL(url) }
  }, [src, stored])
  const resolved = stored ? (local?.source === src ? local.url : undefined) : src
  return resolved && failedSource !== src ? <img className={className} src={resolved} alt={alt} loading="lazy" onError={() => setFailedSource(src)} />
    : <span className={className + ' ' + s.photoFallback}>{alt}</span>
}

export function ShopScreen({ go, back }: ScreenProps) {
  const state = useDemoState()
  const products = useShopProducts()
  const [query, setQuery] = useState('')
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const country = state.shopCountry
  const destination = state.shopDestination
  useEffect(() => {
    if (country || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setSlide(index => (index + 1) % PROMOS.length), 4000)
    return () => window.clearInterval(timer)
  }, [country, paused])
  const cities = [...new Set(products.filter(product => product.country === country).map(product => product.destination))].filter(Boolean)
  const normalized = query.trim().toLocaleLowerCase()
  const countries = [...new Set(products.map(product => product.country))]
  const visibleCountries = countries.filter(name => {
    const aliases = SHOP_COUNTRIES.find(country => country.name === name)?.aliases ?? []
    const regions = products.filter(product => product.country === name).map(product => product.destination)
    return [name, ...aliases, ...regions].some(value => value.toLocaleLowerCase().includes(normalized))
  })
  const visible = products.filter(product => product.country === country && (!destination || product.destination === destination) &&
    (product.name + product.region + product.category + product.seller).toLocaleLowerCase().includes(normalized))
  const select = (city: string) => {
    setQuery('')
    setDemoState({ shopCountry: country ?? countryOf(city), shopDestination: city })
  }
  const selectCountry = (name: string) => {
    setQuery('')
    setDemoState({ shopCountry: name, shopDestination: undefined })
  }
  const banner = PROMOS[slide]
  const bannerPrices = products.filter(product => product.destination === banner.destination)
    .flatMap(product => product.options.filter(bookable).map(option => Number(option.adult)))
  const promo = { ...banner, price: bannerPrices.length ? won(Math.min(...bannerPrices)) + '부터' : '상품 둘러보기' }
  return <Page title={country ? (destination ?? country) + ' 상품' : '여행 상점'} back={country ? () => {
    setQuery('')
    setDemoState({ shopCountry: undefined, shopDestination: undefined })
  } : back} tabGo={country ? undefined : go}>
    {!country ? <>
      <label className={s.search}>어디로 여행 가세요?<input value={query} onChange={e => setQuery(e.target.value)} placeholder="국가·도시 검색 · 일본, 파리, 다낭" /></label>
      <section className={s.promotion} aria-label="여행 특가" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)}>
        <button className={s.banner} onClick={() => select(promo.destination)} aria-label={promo.title + ' ' + promo.price + ' 상품 보기'}>
          <ShopPhoto key={promo.image} src={promo.image} alt="" className={s.bannerPhoto} />
          <span className={s.bannerShade} />
          <span className={s.bannerCopy}><small>{promo.label}</small><strong>{promo.title}</strong><b>{promo.price}</b></span>
        </button>
        <div className={s.bannerControls}>
          <button aria-label="이전 특가" onClick={() => { setPaused(true); setSlide((slide + PROMOS.length - 1) % PROMOS.length) }}>‹</button>
          <span>{slide + 1} / {PROMOS.length}</span>
          <button aria-label="다음 특가" onClick={() => { setPaused(true); setSlide((slide + 1) % PROMOS.length) }}>›</button>
          <button aria-label={paused ? '특가 자동 넘김 재생' : '특가 자동 넘김 일시정지'} onClick={() => setPaused(!paused)}>{paused ? '▶' : 'Ⅱ'}</button>
        </div>
      </section>
      <div className={s.section}><h2>{normalized ? '검색 결과' : '어느 나라로 떠나세요?'}</h2></div>
      <div className={s.destinations}>{visibleCountries.map(name => {
        const items = products.filter(product => product.country === name)
        return <button key={name} onClick={() => selectCountry(name)}>
          <ShopPhoto src={items[0].image} alt={name} className={s.destinationPhoto} />
          <strong>{name}</strong><span>{items.length}개 상품 · {new Set(items.map(item => item.destination)).size}개 여행지</span>
        </button>
      })}</div>
      {!visibleCountries.length && <p className={s.notice}>검색한 국가나 도시의 상품이 아직 없어요.</p>}
    </> : <>
      <button className={s.changeDestination} onClick={() => { setDemoState({ shopCountry: undefined, shopDestination: undefined }); setQuery('') }}>국가 변경 · {country} ⌄</button>
      <label className={s.search}>상품 검색<input value={query} onChange={e => setQuery(e.target.value)} placeholder={(destination ?? country) + ' 상품명·도시·업체명'} /></label>
      <div className={s.cityFilters} aria-label="도시 선택">
        <button aria-pressed={!destination} onClick={() => {setQuery(''); setDemoState({shopDestination: undefined})}}>전체</button>
        {cities.map(city => <button key={city} aria-pressed={destination === city} onClick={() => select(city)}>{city}</button>)}
      </div>
      <div className={s.section}><h2>{destination ?? country} 추천 상품</h2><span>{visible.length}개</span></div>
      {visible.map(product => {
        const options = product.options.filter(bookable)
        return <button className={s.product} key={product.id} disabled={!options.length} onClick={() => {
          setDemoState({ shopProductId: product.id, shopBooking: undefined })
          go('shop-product')
        }}>
          <ShopPhoto src={product.image} alt={product.name + ' 여행 이미지'} className={s.productPhoto} />
          <div className={s.productCopy}><small>{product.seller} · {product.region}</small><h3>{product.name}</h3>
            <p>{product.duration}</p><strong>{options.length ? won(Math.min(...options.map(o => Number(o.adult)))) + '부터' : '매진'}</strong></div>
        </button>
      })}
      {!visible.length && <p className={s.notice}>조건에 맞는 상품이 없어요. 검색어를 바꿔 주세요.</p>}
    </>}
  </Page>
}

export function ShopProductScreen({ go, back }: ScreenProps) {
  const currentTrip = useCurrentTrip()
  const state = useDemoState()
  const products = useShopProducts()
  const product = products.find(p => p.id === state.shopProductId)
  const matchingTrips = allTrips(state).filter(trip => product && destinationOf(trip.name) === product.destination)
  const initialTrip = matchingTrips.find(trip => trip.id === currentTrip.id) ?? matchingTrips[0] ?? currentTrip
  const [tripId, setTripId] = useState(initialTrip.id)
  const trip = matchingTrips.find(trip => trip.id === tripId) ?? matchingTrips[0] ?? initialTrip
  const [photoIndex, setPhotoIndex] = useState(0)
  const [optionIndex, setOptionIndex] = useState(() => Math.max(0, product?.options.findIndex(bookable) ?? 0))
  const [time, setTime] = useState(() => product?.options.find(bookable)?.name.match(/\d{2}:\d{2}/)?.[0] ?? '09:00')
  const [date, setDate] = useState(dateAt(trip, Math.min(state.dayIndex, trip.days.length - 1)))
  const [count, setCount] = useState(1)
  if (!product) return <Page title="상품 상세" back={back}><p className={s.notice}>상점에서 상품을 선택해 주세요.</p><button className={s.cta} onClick={() => go('shop')}>상점으로</button></Page>
  const photos = product.images?.length ? product.images.map(image => 'indexeddb:' + image.id) : [product.image]
  const selectedPhoto = photos[photoIndex] ?? photos[0]
  const option = product.options[optionIndex]
  const stock = remaining(product, optionIndex, date)
  const weekday = '일월화수목금토'[new Date(date + 'T00:00:00Z').getUTCDay()]
  const valid = matchingTrips.length > 0 && !!option && bookable(option) && count > 0 && Number.isInteger(count) && count <= stock &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(time) && date >= trip.startIso && date <= trip.endIso && product.days.includes(weekday)
  const submit = () => {
    if (!valid) return
    setDemoState({ shopBooking: {
      id: crypto.randomUUID(), productId: product.id, optionIndex, tripId: trip.id,
      date, time, count, price: Number(option.adult), seller: product.seller, title: product.name,
    } })
    go('shop-checkout')
  }
  return <Page title="상품 상세" back={back}>
    <ShopPhoto src={selectedPhoto} alt={product.name + ' 상품 사진'} className={s.detailPhoto} />
    {photos.length > 1 && <div className={s.photoGallery} aria-label="상품 사진 선택">
      {photos.map((photo, index) => <button type="button" key={photo} aria-label={`상품 사진 ${index + 1}`} aria-pressed={index === photoIndex} onClick={() => setPhotoIndex(index)}>
        <ShopPhoto src={photo} alt={`상품 사진 ${index + 1}`} className={s.galleryPhoto} />
      </button>)}
    </div>}
    <p className={s.seller}>{product.seller} · {product.region}</p><h2 className={s.title}>{product.name}</h2>
    <p className={s.notice}>{product.duration} · 운영 {product.days.join('·')}</p>
    <div className={s.panel}><h3>이용 안내</h3><p>집결 장소 · {product.meetPlace || '예약 후 안내'}</p>
      <p>예약 완료 후 선택한 여행에 바우처가 저장됩니다.</p></div>
    <div className={s.panel}>
      {matchingTrips.length ? <label>바우처를 저장할 여행<select value={trip.id} onChange={e => {
        const selected = matchingTrips.find(trip => trip.id === e.target.value)!
        setTripId(selected.id)
        setDate(selected.startIso)
      }}>{matchingTrips.map(trip => <option key={trip.id} value={trip.id}>{trip.name} · {trip.startIso}</option>)}</select></label>
        : <><p>{product.destination} 여행을 먼저 만들어 주세요.</p><button className={s.secondary} onClick={() => go('add-trip')}>새 여행 만들기</button></>}
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
    const product = loadShopProducts().find(p => p.id === booking.productId)
    const trip = allTrips(latest).find(t => t.id === booking.tripId)
    const option = product?.options[booking.optionIndex]
    if (!product || !trip || destinationOf(trip.name) !== product.destination || !option || Number(option.adult) !== booking.price || remaining(product, booking.optionIndex, booking.date) < booking.count) {
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
      <p>{loadShopProducts().find(p => p.id === booking.productId)?.options[booking.optionIndex]?.name}</p></div>
    <div className={s.panel}><h3>결제 금액</h3><div className={s.total}><span>{won(booking.price)} × {booking.count}명</span><strong>{won(booking.price * booking.count)}</strong></div>
      <p>결제 수단 · 시연용 카드<br />실제 금액이 청구되지 않는 체험 결제입니다.</p></div>
    {error && <p role="alert" className={s.error}>{error}</p>}
    {done ? <><button className={s.cta} onClick={() => go('timeline')}>내 일정에서 확인</button>
      <button className={s.secondary} onClick={() => go('plan')}>바우처 열기</button></>
      : <button className={s.cta} onClick={confirm}>{won(booking.price * booking.count)} 시연 결제</button>}
  </Page>
}
