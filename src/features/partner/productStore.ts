import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react'
import { PARTNER_SAMPLE_PRODUCTS, type PartnerProduct } from '@/data/partnerProducts'
import { loadPartnerCompany } from './companyStore'

const STORAGE_KEY = 'tripoff.partner.products'

interface ProductStore {
  products: PartnerProduct[]
  addProduct: (product: Omit<PartnerProduct, 'id' | 'createdAt'>) => PartnerProduct
  resetProducts: () => void
}

export const ProductStoreContext = createContext<ProductStore | null>(null)

function readProducts(): PartnerProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : undefined
    if (Array.isArray(parsed)) {
      // 이전 시연의 sessionStorage 상품도 한 번 가져온다.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      sessionStorage.removeItem(STORAGE_KEY)
      return parsed
    }
  } catch { /* 저장소를 못 쓰는 환경에서는 예시 상품으로 시작한다. */ }
  return PARTNER_SAMPLE_PRODUCTS
}

let products = readProducts()
const listeners = new Set<() => void>()
function publish(next: PartnerProduct[]) {
  products = next
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* 메모리에서 시연을 계속한다. */ }
  listeners.forEach(listener => listener())
}
function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return
  products = readProducts()
  listeners.forEach(listener => listener())
}
function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (!listeners.size) window.removeEventListener('storage', onStorage)
  }
}

export function loadPartnerProducts(): PartnerProduct[] {
  // 이 탭에 구독자가 없던 동안 다른 탭에서 갱신됐을 수도 있다.
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && JSON.stringify(products) !== raw) {
      const next: unknown = JSON.parse(raw)
      if (Array.isArray(next)) products = next
    }
  } catch { /* 현재 메모리 상태를 사용한다. */ }
  return products
}

export function usePartnerProducts() {
  return useSyncExternalStore(subscribe, loadPartnerProducts)
}

export function useProductStoreValue(): ProductStore {
  const currentProducts = usePartnerProducts()
  const addProduct = useCallback<ProductStore['addProduct']>(input => {
    const created: PartnerProduct = {
      ...input, seller: input.seller ?? loadPartnerCompany().name,
      id: 'P-' + crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10),
    }
    publish([created, ...loadPartnerProducts()])
    return created
  }, [])
  const resetProducts = useCallback(() => publish(PARTNER_SAMPLE_PRODUCTS), [])
  return useMemo(() => ({ products: currentProducts, addProduct, resetProducts }), [currentProducts, addProduct, resetProducts])
}

export function useProductStore(): ProductStore {
  const store = useContext(ProductStoreContext)
  if (!store) throw new Error('useProductStore는 PartnerLayout 안에서만 쓸 수 있어요.')
  return store
}
