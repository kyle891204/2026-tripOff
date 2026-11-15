import { useMemo } from 'react'
import { SHOP_SAMPLE_PRODUCTS, type ShopProduct } from '@/data/shopSamples'
import { countryImage, countryOf, destinationOf } from '@/data/shopCountries'
import { usePartnerProducts } from '@/features/partner/productStore'
export { destinationOf } from '@/data/shopCountries'
export type { ShopProduct } from '@/data/shopSamples'
import { loadPartnerProducts } from '@/features/partner/productStore'
import { loadPartnerCompany } from '@/features/partner/companyStore'

const photo = (id: string) => 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=900&q=80'
// Unsplash 사진 원본. 상품의 실제 제공 사진이 아닌 시연용 여행지 이미지.
// 오사카성 https://unsplash.com/photos/B0va3qyz6Wg
// 제주 https://unsplash.com/photos/I72ncBMZ9Nk
// 제주 해안 https://unsplash.com/photos/7L-Y8yefO7o
export const SHOP_IMAGES = {
  osaka: photo('photo-1724088640547-a9617e2da0df'),
  canal: photo('photo-1584505489290-96eb4e406d08'),
  jeju: photo('photo-1678284948837-45bf97e651c1'),
  coast: photo('photo-1778162346658-93f92fb7904f'),
}


function catalog(partnerProducts: ReturnType<typeof loadPartnerProducts>): ShopProduct[] {
  const fallbackSeller = loadPartnerCompany().name
  const partner = partnerProducts.map(product => {
    const country = product.country || countryOf(product.region)
    return {
      ...product, country, seller: product.seller || fallbackSeller,
      destination: product.destination || destinationOf(product.region),
      image: product.images?.[0] ? 'indexeddb:' + product.images[0].id : product.image || countryImage(country),
    }
  })
  return [...partner, ...SHOP_SAMPLE_PRODUCTS]
}

export function loadShopProducts(): ShopProduct[] {
  return catalog(loadPartnerProducts())
}

export function useShopProducts(): ShopProduct[] {
  const partner = usePartnerProducts()
  return useMemo(() => catalog(partner), [partner])
}
