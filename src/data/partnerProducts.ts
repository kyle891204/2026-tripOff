/** 파트너센터 상품 목록 시연용 데이터. 실제로는 상품 API 응답으로 교체한다. */

export type CodeType = 'qr' | 'barcode' | 'number'

export interface ProductOption {
  name: string
  /** 원 단위 숫자 문자열 */
  adult: string
  child: string
  stock: string
}

export interface PartnerProduct {
  id: string
  name: string
  category: string
  country?: string
  destination?: string
  seller?: string
  image?: string
  images?: Array<{ id: string; name: string }>
  region: string
  duration: string
  options: ProductOption[]
  days: string[]
  codeType: CodeType
  meetPlace: string
  /** YYYY-MM-DD */
  createdAt: string
}

export const CODE_TYPE_LABEL: Record<CodeType, string> = {
  qr: 'QR 코드',
  barcode: '바코드',
  number: '확정번호',
}

export const PARTNER_SAMPLE_PRODUCTS: PartnerProduct[] = [
  {
    id: 'P-1003',
    name: '제주 동부 오름 트레킹',
    category: '투어·가이드',
    region: '제주 서귀포시',
    duration: '약 4시간',
    options: [
      { name: '오전 출발 09:00', adult: '45000', child: '30000', stock: '12' },
      { name: '오후 출발 14:00', adult: '45000', child: '30000', stock: '12' },
    ],
    days: ['월', '화', '수', '목', '금', '토'],
    codeType: 'qr',
    meetPlace: '성산일출봉 주차장 A구역 매표소 앞',
    createdAt: '2026-10-28',
  },
  {
    id: 'P-1002',
    name: '우도 전기자전거 투어',
    category: '액티비티',
    region: '제주 제주시 우도면',
    duration: '약 3시간',
    options: [
      { name: '1인용 자전거', adult: '28000', child: '', stock: '20' },
      { name: '2인용 자전거', adult: '48000', child: '', stock: '10' },
    ],
    days: ['월', '화', '수', '목', '금', '토', '일'],
    codeType: 'qr',
    meetPlace: '성산항 종합여객터미널 2번 창구',
    createdAt: '2026-10-15',
  },
  {
    id: 'P-1001',
    name: '한라산 일출 가이드',
    category: '투어·가이드',
    region: '제주 제주시',
    duration: '약 7시간',
    options: [
      { name: '성판악 코스', adult: '89000', child: '', stock: '8' },
      { name: '관음사 코스', adult: '95000', child: '', stock: '8' },
    ],
    days: ['토', '일'],
    codeType: 'number',
    meetPlace: '성판악 탐방안내소 앞',
    createdAt: '2026-09-30',
  },
]
