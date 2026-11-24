import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { PartnerButton as Button, partnerStyles as p, useProductStore, useToast } from '@/features/partner'
import { CODE_TYPE_LABEL, type PartnerProduct } from '@/data/partnerProducts'
import { countryImage, countryOf } from '@/data/shopCountries'
import { ROUTES } from '@/lib/routes'
import { ShopPhoto } from '@/features/app-screens/screens/ShopScreens'
import { cn } from '@/lib/cn'
import s from './ProductListPage.module.css'
import h from '@/features/demo/highlight.module.css'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

function minPrice(product: PartnerProduct) {
  const prices = product.options.map((o) => Number(o.adult)).filter((n) => n > 0)
  if (!prices.length) return '가격 미정'
  return `${Math.min(...prices).toLocaleString('ko-KR')}원~`
}

/** 앱 상점과 같은 사진: 상품 사진이 없으면 나라 대표 사진 */
function Thumb({ product }: { product: PartnerProduct }) {
  const src = product.image || countryImage(product.country || countryOf(product.region))
  const [failed, setFailed] = useState(false)
  // 등록할 때 올린 사진이 있으면 그 사진 (브라우저 저장소에 보관)
  if (product.images?.[0]) return <ShopPhoto src={'indexeddb:' + product.images[0].id} alt="" className={s.thumb} />
  return src && !failed
    ? <img className={s.thumb} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
    : <span className={cn(s.thumb, s.thumbEmpty)} aria-hidden="true">{product.name.slice(0, 1)}</span>
}

function shortDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${y}.${m}.${d}`
}

export default function ProductListPage() {
  const { products, resetProducts } = useProductStore()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const createdId = (location.state as { createdId?: string } | null)?.createdId
  const created = products.find((x) => x.id === createdId)

  useEffect(() => {
    if (created) toast.show(`'${created.name}' 상품을 등록했어요.`)
    // 등록 직후 한 번만 알린다 (createdId가 바뀔 때만)
  }, [createdId])

  return (
    <main className={p.main}>
      <header className={p.header}>
        <div className={p.headerTitle}>
          <h1>상품 등록·관리</h1>
          <p className={p.desc}>등록한 상품은 바로 판매되고, 예약이 확정되면 바우처가 고객의 TripOff 일정에 자동으로 들어갑니다.</p>
        </div>
        <div className={p.actions}>
          <Button variant="primary" onClick={() => navigate(ROUTES.partnerProductNew)}>
            + 새 상품 등록
          </Button>
        </div>
      </header>

      <section className={cn(p.card, s.list)} aria-label="등록된 상품">
        <div className={s.toolbar}>
          <p className={s.count}>
            판매 중인 상품 <strong>{products.length}</strong>개
          </p>
          <button type="button" className={s.reset} onClick={resetProducts}>
            예시 데이터로 되돌리기
          </button>
        </div>
        <table className={s.table}>
          <thead>
            <tr>
              <th>상품</th>
              <th style={{ width: 120 }}>카테고리</th>
              <th style={{ width: 140 }}>옵션 · 최저가</th>
              <th style={{ width: 200 }}>운영 요일</th>
              <th style={{ width: 100 }}>확인 방식</th>
              <th style={{ width: 110 }}>등록일</th>
              <th style={{ width: 90 }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={product.id === createdId ? cn(s.new, h.freshPartner) : undefined}>
                <td>
                  <div className={s.product}>
                    <Thumb product={product} />
                    <div>
                      <span className={s.name}>
                        {product.name}
                        {product.id === createdId && <span className={s.newTag}>NEW</span>}
                      </span>
                      <span className={s.sub}>
                        {product.region}
                        {product.duration && ` · ${product.duration}`}
                      </span>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>
                  <span className={s.name}>{product.options.length}개</span>
                  <span className={s.sub}>{minPrice(product)}</span>
                </td>
                <td>
                  <div className={s.days} aria-label={`운영 요일: ${product.days.join(', ') || '없음'}`}>
                    {DAYS.map((d) => (
                      <span key={d} className={cn(s.day, product.days.includes(d) && s.dayOn)} aria-hidden="true">
                        {d}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{CODE_TYPE_LABEL[product.codeType]}</td>
                <td>{shortDate(product.createdAt)}</td>
                <td>
                  <span className={s.onSale}>판매 중</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className={p.hint}>
        예약이 들어온 상품의 바우처는 <Link to={ROUTES.partnerVouchers} className={s.inlineLink}>
          바우처 관리
        </Link>에서 확인할 수 있어요.
      </p>
      {toast.node}
    </main>
  )
}
