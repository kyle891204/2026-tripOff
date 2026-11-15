/** 상품과 가격은 시연용. 사진은 해당 국가의 대표 여행 이미지다. */
export const SHOP_COUNTRIES = [
  { name: '대한민국', aliases: ['한국', '국내', 'Korea'], cities: ['제주', '서울', '부산', '경주', '강릉'], image: 'https://images.unsplash.com/photo-1678284948837-45bf97e651c1' },
  { name: '일본', aliases: ['Japan'], cities: ['오사카', '도쿄', '교토', '후쿠오카', '삿포로'], image: 'https://images.unsplash.com/photo-1724088640547-a9617e2da0df' },
  { name: '대만', aliases: ['Taiwan'], cities: ['타이베이', '가오슝', '타이중', '지우펀'], image: 'https://images.unsplash.com/photo-1572715381359-002b1eabd56b' },
  { name: '태국', aliases: ['Thailand'], cities: ['방콕', '치앙마이', '푸껫', '파타야'], image: 'https://images.unsplash.com/photo-1531169628939-e84f860fa5d6' },
  { name: '베트남', aliases: ['Vietnam'], cities: ['다낭', '하노이', '호찌민', '호이안', '나트랑'], image: 'https://images.unsplash.com/photo-1674296067534-0f9769040781' },
  { name: '싱가포르', aliases: ['Singapore'], cities: ['싱가포르', '센토사'], image: 'https://images.unsplash.com/photo-1637062285066-d408467a87a8' },
  { name: '프랑스', aliases: ['France'], cities: ['파리', '니스', '리옹'], image: 'https://images.unsplash.com/photo-1681407978451-7244b4497283' },
  { name: '이탈리아', aliases: ['Italy'], cities: ['로마', '피렌체', '베네치아', '밀라노'], image: 'https://images.unsplash.com/photo-1603105722273-98bacd29ed70' },
  { name: '스페인', aliases: ['Spain'], cities: ['바르셀로나', '마드리드', '세비야'], image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded' },
  { name: '미국', aliases: ['USA', 'America'], cities: ['뉴욕', '로스앤젤레스', '샌프란시스코', '라스베이거스'], image: 'https://images.unsplash.com/photo-1694732519038-dcc9379eb148' },
]

export function destinationOf(region: string) {
  const city = SHOP_COUNTRIES.flatMap(country => country.cities).find(city => region.includes(city))
  if (city) return city
  const words = region.trim().split(/\s+/)
  return SHOP_COUNTRIES.some(country => country.name === words[0]) ? words[1] ?? words[0] : words[0]
}

export function countryOf(region: string) {
  const destination = destinationOf(region)
  return SHOP_COUNTRIES.find(country => region.includes(country.name) || country.cities.includes(destination))?.name ?? '기타 여행지'
}

export function countryImage(country: string) {
  const image = SHOP_COUNTRIES.find(item => item.name === country)?.image
  return image ? image + '?auto=format&fit=crop&w=900&q=80' : ''
}
