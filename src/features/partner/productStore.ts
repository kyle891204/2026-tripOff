import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PARTNER_SAMPLE_PRODUCTS, type PartnerProduct } from '@/data/partnerProducts'

/** 시연 중 새로고침해도 등록한 상품이 남도록 sessionStorage에 보관한다. */
const STORAGE_KEY = 'tripoff.partner.products'

interface ProductStore {
  products: PartnerProduct[]
  addProduct: (product: Omit<PartnerProduct, 'id' | 'createdAt'>) => PartnerProduct
  resetProducts: () => void
}

export const ProductStoreContext = createContext<ProductStore | null>(null)

export function loadPartnerProducts(): PartnerProduct[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as PartnerProduct[]
  } catch {
    // 저장소를 못 쓰는 환경이면 예시 데이터로 시작
  }
  return PARTNER_SAMPLE_PRODUCTS
}

function today() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** PartnerLayout에서 한 번만 호출해 Provider 값으로 내려준다. */
export function useProductStoreValue(): ProductStore {
  const [products, setProducts] = useState<PartnerProduct[]>(loadPartnerProducts)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    } catch {
      // 저장 실패는 시연에 영향 없음
    }
  }, [products])

  const addProduct = useCallback<ProductStore['addProduct']>((input) => {
    const created: PartnerProduct = { ...input, id: `P-${Date.now().toString().slice(-6)}`, createdAt: today() }
    setProducts((prev) => [created, ...prev])
    return created
  }, [])

  const resetProducts = useCallback(() => setProducts(PARTNER_SAMPLE_PRODUCTS), [])

  return useMemo(() => ({ products, addProduct, resetProducts }), [products, addProduct, resetProducts])
}

export function useProductStore(): ProductStore {
  const store = useContext(ProductStoreContext)
  if (!store) throw new Error('useProductStore는 PartnerLayout 안에서만 쓸 수 있어요.')
  return store
}
