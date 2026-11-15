import type { PartnerProduct } from '@/data/partnerProducts'
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

export interface ShopProduct extends PartnerProduct {
  destination: string
  seller: string
  image: string
}

export function destinationOf(region: string) {
  const city = ['오사카', '제주', '도쿄', '서울', '부산', '다낭', '방콕', '타이베이', '파리'].find(name => region.includes(name))
  return city ?? region.trim().split(/\s+/)[0]
}

// 상점 흐름을 보여주기 위한 가상 상품·판매가.
const OSAKA_SAMPLES: ShopProduct[] = [
  {
    id: 'SHOP-OSAKA-CASTLE', destination: '오사카', seller: '오사카 로컬투어 · 시연 업체',
    image: SHOP_IMAGES.osaka, name: '오사카성 공원 산책 투어', category: '투어·가이드',
    region: '일본 오사카', duration: '약 2시간',
    options: [{ name: '오전 출발 10:00', adult: '19000', child: '12000', stock: '20' }, { name: '오후 출발 14:00', adult: '19000', child: '12000', stock: '20' }],
    days: ['월', '화', '수', '목', '금', '토', '일'], codeType: 'qr', meetPlace: '오사카성 공원 입구', createdAt: '2026-11-15',
  },
  {
    id: 'SHOP-OSAKA-NIGHT', destination: '오사카', seller: '난바 트래블 · 시연 업체',
    image: SHOP_IMAGES.canal, name: '도톤보리 야경 워킹 투어', category: '투어·가이드',
    region: '일본 오사카 난바', duration: '약 1시간 30분',
    options: [{ name: '저녁 출발 18:30', adult: '25000', child: '15000', stock: '12' }],
    days: ['월', '화', '수', '목', '금', '토', '일'], codeType: 'qr', meetPlace: '도톤보리 에비스바시 앞', createdAt: '2026-11-15',
  },
]

export function loadShopProducts(): ShopProduct[] {
  const seller = loadPartnerCompany().name
  const partner = loadPartnerProducts().map(product => ({
    ...product, seller, destination: destinationOf(product.region),
    image: product.region.includes('제주')
      ? (product.name.includes('우도') || product.name.includes('카약') ? SHOP_IMAGES.coast : SHOP_IMAGES.jeju)
      : product.region.includes('오사카') ? SHOP_IMAGES.osaka : '',
  }))
  return [...partner, ...OSAKA_SAMPLES]
}
