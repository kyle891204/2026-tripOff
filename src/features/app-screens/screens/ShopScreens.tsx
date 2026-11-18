import { fileRecord } from '../voucherFiles'
import { SHOP_COUNTRIES, countryOf, countryImage } from '@/data/shopCountries'
import { useEffect, useState, type ReactNode } from 'react'
import { won } from '@/features/partner/calc'
import type { PartnerProduct } from '@/data/partnerProducts'
import Screen from '../parts/Screen'
import TabBar from '../parts/TabBar'
import { destinationOf, loadShopProducts, useShopProducts } from '../shopCatalog'
import { IconBack } from '../parts/icons'
import type { Plan, Trip } from '../mock'
import { addSoloPlan, allTrips, findTrip, getDemoState, moveSoloToTrip, setDemoState, todayIso, toggleFavorite, tripsOn, useDemoState } from '../store'
import { HeartIcon } from './MyPageScreens'
import type { ScreenProps } from '../types'
import s from './ShopScreens.module.css'

function Page({ title, back, children, tabGo, action }: { title: string; back: () => void; children: ReactNode; tabGo?: ScreenProps['go']; action?: ReactNode }) {
  return <Screen bg="var(--mist)" label={title}>
    {/* 탭 첫 화면은 제목 줄 없이 바로 검색부터 */}
    {!tabGo && <header className={s.header}><button aria-label="뒤로" onClick={back}><IconBack /></button><h1>{title}</h1>{action ?? <span />}</header>}
    <div className={s.body} style={tabGo ? { top: 80, bottom: 84 } : undefined}>{children}</div>
    {tabGo && <TabBar active="shop" go={tabGo} />}
  </Screen>
}

const CATEGORY_ORDER = ['투어·가이드', '미식', '체험·클래스', '자연·액티비티', '야경·포토', '액티비티', '입장권', '교통', '숙박']
const categoryRank = (name: string) => { const index = CATEGORY_ORDER.indexOf(name); return index < 0 ? CATEGORY_ORDER.length : index }

function bookable(option: PartnerProduct['options'][number]) {
  return Number(option.stock) > 0 && Number(option.adult) > 0
}

function remaining(product: PartnerProduct, optionIndex: number, date: string) {
  const used = (getDemoState().shopOrders ?? []).filter(order =>
    !getDemoState().orderChanges?.[order.id] && order.productId === product.id && order.optionIndex === optionIndex && order.date === date
  ).reduce((sum, order) => sum + order.count, 0)
  return Math.max(0, Number(product.options[optionIndex]?.stock ?? 0) - used)
}

const PROMOS = SHOP_COUNTRIES.map(country => ({
  destination: country.cities[0], image: countryImage(country.name),
  label: country.name + '에서 만나는 새로운 하루',
  title: country.cities[0] + ' 투어 · 액티비티',
}))


export function ShopPhoto({ src, alt, className }: { src: string; alt: string; className: string }) {
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
  const [loadedSource, setLoadedSource] = useState('')
  const resolved = stored ? (local?.source === src ? local.url : undefined) : src
  const failed = failedSource === src
  // 저장소에서 꺼내는 중인 사진은 대체 문구 대신 로딩 표시
  if (!resolved && !failed) return <span className={className + ' ' + s.photoLoading} role="img" aria-label={alt ? alt + ' 불러오는 중' : undefined} aria-hidden={alt ? undefined : true} />
  if (!resolved || failed) return <span className={className + ' ' + s.photoFallback}>{alt}</span>
  const loaded = loadedSource === src
  return <img className={className + ' ' + (loaded ? s.photoLoaded : s.photoLoading)} src={resolved} alt={alt} loading="lazy"
    ref={img => { if (img?.complete && img.naturalWidth && !loaded) setLoadedSource(src) }}
    onLoad={() => setLoadedSource(src)} onError={() => setFailedSource(src)} />
}

export function ShopScreen({ go, back }: ScreenProps) {
  const state = useDemoState()
  const products = useShopProducts()
  const [query, setQuery] = useState('')
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [category, setCategory] = useState('')
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
  const inPlace = products.filter(product => product.country === country && (!destination || product.destination === destination))
  const categories = [...new Set(inPlace.map(product => product.category))]
    .sort((a, b) => categoryRank(a) - categoryRank(b))
  const activeCategory = categories.includes(category) ? category : ''
  const visible = inPlace.filter(product => (!activeCategory || product.category === activeCategory) &&
    (product.name + product.region + product.category + product.seller).toLocaleLowerCase().includes(normalized))
  const select = (city: string) => {
    setQuery('')
    setDemoState({ shopCountry: country ?? countryOf(city), shopDestination: city })
  }
  const selectCountry = (name: string) => {
    setQuery('')
    setDemoState({ shopCountry: name, shopDestination: undefined })
  }
  const favorites = (state.favorites ?? []).map(id => products.find(p => p.id === id)).filter(p => !!p)
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
      {!normalized && favorites.length > 0 && <>
        <div className={s.section}><h2>즐겨찾기</h2><button type="button" className={s.more} onClick={() => go('favorites')}>전체 보기 {favorites.length}</button></div>
        <div className={s.favStrip}>{favorites.map(product => <button type="button" key={product.id} onClick={() => { setDemoState({ shopProductId: product.id, shopBooking: undefined }); go('shop-product') }}>
          <ShopPhoto src={product.image} alt="" className={s.favPhoto} /><strong>{product.name}</strong><span>{product.destination}</span>
        </button>)}</div>
      </>}
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
      <label className={s.search}>상품 검색<input value={query} onChange={e => setQuery(e.target.value)} placeholder={(destination ?? country) + ' 상품명·도시·업체명'} /></label>
      <div className={s.cityFilters} aria-label="도시 선택">
        <button aria-pressed={!destination} onClick={() => {setQuery(''); setDemoState({shopDestination: undefined})}}>전체</button>
        {cities.map(city => <button key={city} aria-pressed={destination === city} onClick={() => select(city)}>{city}</button>)}
      </div>
      {categories.length > 1 && <div className={s.categoryFilters} role="group" aria-label="카테고리 선택">
        <button aria-pressed={!activeCategory} onClick={() => setCategory('')}>전체 <span>{inPlace.length}</span></button>
        {categories.map(name => <button key={name} aria-pressed={activeCategory === name} onClick={() => setCategory(name)}>
          {name} <span>{inPlace.filter(product => product.category === name).length}</span>
        </button>)}
      </div>}
      <div className={s.section}><h2>{destination ?? country} {activeCategory || '추천 상품'}</h2><span>{visible.length}개</span></div>
      {visible.map(product => {
        const options = product.options.filter(bookable)
        const fav = (state.favorites ?? []).includes(product.id)
        return <div className={s.productWrap} key={product.id}><button className={s.product} disabled={!options.length} onClick={() => {
          setDemoState({ shopProductId: product.id, shopBooking: undefined })
          go('shop-product')
        }}>
          <ShopPhoto src={product.image} alt={product.name + ' 여행 이미지'} className={s.productPhoto} />
          <div className={s.productCopy}><small>{product.seller} · {product.region}</small><h3>{product.name}</h3>
            <p>{product.duration}</p><strong>{options.length ? won(Math.min(...options.map(o => Number(o.adult)))) + '부터' : '매진'}</strong></div>
        </button>
        <button type="button" className={s.heart} aria-pressed={fav} aria-label={product.name + (fav ? ' 즐겨찾기 해제' : ' 즐겨찾기')} onClick={() => toggleFavorite(product.id)}><HeartIcon on={fav} /></button></div>
      })}
      {!visible.length && <p className={s.notice}>조건에 맞는 상품이 없어요. 검색어를 바꿔 주세요.</p>}
    </>}
  </Page>
}

export function ShopProductScreen({ go, back }: ScreenProps) {
  const state = useDemoState()
  const products = useShopProducts()
  const product = products.find(p => p.id === state.shopProductId)
  const today = todayIso(state)
  // 같은 여행지로 가는 다가오는 여행이 있으면 그 첫날을 기본 이용일로
  const upcoming = allTrips(state).filter(trip => product && destinationOf(trip.name) === product.destination && trip.endIso >= today)
    .sort((a, b) => a.startIso.localeCompare(b.startIso))[0]
  const [photoIndex, setPhotoIndex] = useState(0)
  const [optionIndex, setOptionIndex] = useState(() => Math.max(0, product?.options.findIndex(bookable) ?? 0))
  const [time, setTime] = useState(() => product?.options.find(bookable)?.name.match(/\d{2}:\d{2}/)?.[0] ?? '09:00')
  const [date, setDate] = useState(() => upcoming ? (upcoming.startIso < today ? today : upcoming.startIso) : today)
  const [count, setCount] = useState(1)
  if (!product) return <Page title="상품 상세" back={back}><p className={s.notice}>상점에서 상품을 선택해 주세요.</p><button className={s.cta} onClick={() => go('shop')}>상점으로</button></Page>
  const photos = product.images?.length ? product.images.map(image => 'indexeddb:' + image.id) : [product.image]
  const selectedPhoto = photos[photoIndex] ?? photos[0]
  const option = product.options[optionIndex]
  const stock = remaining(product, optionIndex, date)
  const weekday = '일월화수목금토'[new Date(date + 'T00:00:00Z').getUTCDay()]
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date)
  const overlap = dateOk ? tripsOn(date, trip => destinationOf(trip.name) === product.destination, state) : []
  const valid = !!option && bookable(option) && count > 0 && Number.isInteger(count) && count <= stock &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(time) && dateOk && date >= today && product.days.includes(weekday)
  const submit = () => {
    if (!valid) return
    setDemoState({ shopBooking: {
      id: crypto.randomUUID(), productId: product.id, optionIndex, tripId: '',
      date, time, count, price: Number(option.adult), seller: product.seller, title: product.name,
    } })
    go('shop-checkout')
  }
  const fav = (state.favorites ?? []).includes(product.id)
  return <Page title="상품 상세" back={back} action={<button type="button" className={s.headerHeart} aria-pressed={fav} aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기'} onClick={() => toggleFavorite(product.id)}><HeartIcon on={fav} /></button>}>
    <ShopPhoto src={selectedPhoto} alt={product.name + ' 상품 사진'} className={s.detailPhoto} />
    {photos.length > 1 && <div className={s.photoGallery} aria-label="상품 사진 선택">
      {photos.map((photo, index) => <button type="button" key={photo} aria-label={`상품 사진 ${index + 1}`} aria-pressed={index === photoIndex} onClick={() => setPhotoIndex(index)}>
        <ShopPhoto src={photo} alt={`상품 사진 ${index + 1}`} className={s.galleryPhoto} />
      </button>)}
    </div>}
    <p className={s.seller}>{product.seller} · {product.region}</p><h2 className={s.title}>{product.name}</h2>
    <p className={s.notice}>{product.duration} · 운영 {product.days.join('·')}</p>
    <div className={s.panel}><h3>이용 안내</h3><p>집결 장소 · {product.meetPlace || '예약 후 안내'}</p>
      <p>예약하면 바우처가 내 일정에 저장돼요. 이용일이 내 여행 기간에 들어가면 그 여행에 넣을지 물어볼게요.</p></div>
    <div className={s.panel}>
      <label>옵션<select value={optionIndex} onChange={e => {
        const index = Number(e.target.value)
        setOptionIndex(index)
        setTime(product.options[index].name.match(/\d{2}:\d{2}/)?.[0] ?? '09:00')
      }}>
        {product.options.map((o, i) => <option key={i} value={i} disabled={!bookable(o)}>{o.name} · {won(Number(o.adult))}</option>)}
      </select></label>
      <label>이용일<input type="date" min={today} value={date} onChange={e => setDate(e.target.value)} /></label>
      <label>이용 시간<input type="time" value={time} onChange={e => setTime(e.target.value)} /></label>
      <label>성인 인원<input type="number" min="1" max={stock} value={count} onChange={e => setCount(Number(e.target.value))} /></label>
      <p>{overlap.length ? `「${overlap[0].name}」 여행 기간이에요 · ` : ''}선택일 잔여 {stock}명</p>
      {!valid && <p role="status">오늘 이후 운영 요일({product.days.join('·')})의 날짜, 옵션, 잔여 인원을 확인해 주세요.</p>}
    </div>
    <div className={s.total}><span>총 상품 금액</span><strong>{won(Number(option?.adult ?? 0) * count)}</strong></div>
    <button className={s.cta} disabled={!valid} onClick={submit}>예약·결제하기</button>
  </Page>
}

export function ShopCheckoutScreen({ go, back }: ScreenProps) {
  const state = useDemoState()
  const booking = state.shopBooking
  const [error, setError] = useState('')
  const [decided, setDecided] = useState('')
  const order = booking && (state.shopOrders ?? []).find(order => order.id === booking.id)
  const done = !!order
  const orderTrip = order ? findTrip(order.tripId, state) : undefined
  const product = booking && loadShopProducts().find(p => p.id === booking.productId)
  // 결제 후 아직 여행 밖에 있으면, 기간이 겹치는 여행에 넣을지 묻기
  const suggestions = orderTrip?.solo && booking ? tripsOn(booking.date, trip => !!product && destinationOf(trip.name) === product.destination, state) : []
  const put = (trip: Trip) => {
    if (!order) return
    moveSoloToTrip(order.planId ?? 'shop-' + order.id, trip.id)
    setDecided(`「${trip.name}」 여행에 넣었어요`)
  }
  const confirm = () => {
    if (!booking) return
    const latest = getDemoState()
    if ((latest.shopOrders ?? []).some(order => order.id === booking.id)) return
    const product = loadShopProducts().find(p => p.id === booking.productId)
    const option = product?.options[booking.optionIndex]
    if (!product || !option || Number(option.adult) !== booking.price || remaining(product, booking.optionIndex, booking.date) < booking.count) {
      setError('상품 가격이나 잔여 인원이 변경됐어요. 상품 상세에서 다시 선택해 주세요.')
      return
    }
    const plan: Plan = {
      id: 'shop-' + booking.id, day: 0, time: booking.time,
      title: booking.title, icon: 'ticket', source: { kind: 'agency', name: booking.seller },
      location: product.meetPlace, note: option.name, people: '성인 ' + booking.count + '명',
      code: 'TO-' + booking.id.slice(0, 8).toUpperCase(), qrValue: 'tripoff-demo:' + booking.id,
    }
    // 먼저 여행 밖 일정으로 저장하고, 겹치는 여행이 있으면 완료 화면에서 옮길지 묻는다
    const soloId = 'solo-' + plan.id
    addSoloPlan(booking.date, plan, {
      shopOrders: [...(latest.shopOrders ?? []), { ...booking, tripId: soloId, planId: plan.id, paidAt: new Date().toISOString().slice(0, 16) }],
      tripId: soloId, dayIndex: 0, planId: plan.id,
    })
  }
  if (!booking) return <Page title="예약·결제" back={back}><p className={s.notice}>먼저 상품과 이용일을 선택해 주세요.</p><button className={s.cta} onClick={() => go('shop')}>상품 둘러보기</button></Page>
  return <Page title={done ? '예약 완료' : '예약·결제'} back={back}>
    {done && <div className={s.hero}><p>바우처가 {orderTrip && !orderTrip.solo ? `「${orderTrip.name}」 여행에` : '내 일정에'} 저장됐어요</p><h2>예약이 완료됐어요.</h2><span>{decided || '일정에서 티켓을 바로 확인해 보세요.'}</span></div>}
    {done && suggestions.length > 0 && !decided && <div className={s.panel} role="group" aria-label="여행에 넣기">
      <h3>{booking.date.slice(5).replace('-', '.')}은 「{suggestions[0].name}」 여행 기간이에요</h3>
      <p>이 바우처를 여행에 넣으면 여행 타임라인과 티켓에서 함께 볼 수 있어요. 넣지 않아도 일정 탭에서 볼 수 있어요.</p>
      {suggestions.map(trip => <button key={trip.id} className={s.cta} onClick={() => put(trip)}>「{trip.name}」 여행에 넣기</button>)}
      <button className={s.secondary} onClick={() => setDecided('여행에 넣지 않고 내 일정에 따로 보관했어요')}>따로 보관할게요</button>
    </div>}
    <div className={s.panel}><small>{booking.seller}</small><h2>{booking.title}</h2><p>{booking.date} {booking.time} · 성인 {booking.count}명</p>
      <p>{loadShopProducts().find(p => p.id === booking.productId)?.options[booking.optionIndex]?.name}</p></div>
    <div className={s.panel}><h3>결제 금액</h3><div className={s.total}><span>{won(booking.price)} × {booking.count}명</span><strong>{won(booking.price * booking.count)}</strong></div>
      <p>결제 수단 · 시연용 카드<br />실제 금액이 청구되지 않는 체험 결제입니다.</p></div>
    {error && <p role="alert" className={s.error}>{error}</p>}
    {done ? <><button className={s.cta} onClick={() => go(orderTrip && !orderTrip.solo ? 'timeline' : 'vouchers')}>내 일정에서 확인</button>
      <button className={s.secondary} onClick={() => go('plan')}>바우처 열기</button></>
      : <button className={s.cta} onClick={confirm}>{won(booking.price * booking.count)} 시연 결제</button>}
  </Page>
}
