/** 파트너센터(여행사 관리자) 시연용 데이터. 실제로는 예약 API 응답으로 교체한다. */

export const PARTNER_COMPANY_NAME = '제주로드트립'

/** "오늘 이용 예정" 기준일. Figma 숫자와 맞추려고 고정했다. 실제로는 new Date()를 쓴다. */
export const PARTNER_DEMO_TODAY = '2026-11-16'

export type VoucherStatus = 'pending' | 'sent' | 'used' | 'cancelled'

export const STATUS_LABEL: Record<VoucherStatus, string> = {
  pending: '발송 대기',
  sent: '발송 완료',
  used: '사용 완료',
  cancelled: '취소',
}

export type HistoryKey = 'issued' | 'sent' | 'viewed' | 'used'

export interface Voucher {
  id: string
  customer: string
  phone: string
  product: string
  option: string
  /** YYYY-MM-DD */
  date: string
  party: string
  status: VoucherStatus
  channel: string
  meeting: string
  history: Partial<Record<HistoryKey, string>>
  /** 고객 앱 상점에서 결제한 바우처면, 고객 앱에 생긴 일정 id */
  planId?: string
}

export const PARTNER_SAMPLE_VOUCHERS: Voucher[] = [
  { id: 'TO-2606-0618', customer: '김용태', phone: '010-****-0000', product: '제주 로컬 푸드 투어', option: '오후 출발 12:30', date: '2026-06-27', party: '성인 1', status: 'pending', channel: 'TripOff 시연', meeting: '제주 동문시장 1번 게이트 · 12:15', history: { issued: '6.26 09:00' } },
  {
    id: 'TO-2611-0418', customer: '김민준', phone: '010-****-2381', product: '제주 동부 오름 트레킹', option: '오전 출발 09:00',
    date: '2026-11-18', party: '성인 2', status: 'pending', channel: 'TripOff 앱', meeting: '성산일출봉 주차장 A구역 · 08:45',
    history: { issued: '11.14 10:12' },
  },
  {
    id: 'TO-2611-0417', customer: '이서연', phone: '010-****-7714', product: '우도 전기자전거 투어', option: '2인용 자전거',
    date: '2026-11-16', party: '성인 2', status: 'sent', channel: 'TripOff 앱', meeting: '성산항 종합여객터미널 2번 창구 · 09:30',
    history: { issued: '11.13 16:40', sent: '11.13 16:41', viewed: '11.13 18:02' },
  },
  {
    id: 'TO-2611-0415', customer: '박지호', phone: '010-****-0952', product: '한라산 일출 가이드', option: '성판악 코스',
    date: '2026-11-15', party: '성인 1', status: 'used', channel: '전화 예약', meeting: '성판악 탐방안내소 앞 · 03:30',
    history: { issued: '11.10 11:05', sent: '11.10 11:06', viewed: '11.12 21:14', used: '11.15 03:41' },
  },
  {
    id: 'TO-2611-0414', customer: '최유나', phone: '010-****-5530', product: '제주 동부 오름 트레킹', option: '오후 출발 14:00',
    date: '2026-11-16', party: '성인 2 · 아동 1', status: 'sent', channel: 'TripOff 앱', meeting: '성산일출봉 주차장 A구역 · 13:45',
    history: { issued: '11.12 09:20', sent: '11.12 09:21' },
  },
  {
    id: 'TO-2611-0412', customer: '정하준', phone: '010-****-3307', product: '우도 전기자전거 투어', option: '1인용 자전거',
    date: '2026-11-20', party: '성인 1', status: 'pending', channel: 'TripOff 앱', meeting: '성산항 종합여객터미널 2번 창구 · 09:30',
    history: { issued: '11.14 08:55' },
  },
  {
    id: 'TO-2611-0409', customer: '강다은', phone: '010-****-6621', product: '한라산 일출 가이드', option: '관음사 코스',
    date: '2026-11-14', party: '성인 3', status: 'cancelled', channel: 'TripOff 앱', meeting: '관음사 탐방안내소 앞 · 03:30',
    history: { issued: '11.08 14:30', sent: '11.08 14:31' },
  },
  {
    id: 'TO-2611-0406', customer: '윤시우', phone: '010-****-1189', product: '제주 동부 오름 트레킹', option: '오전 출발 09:00',
    date: '2026-11-15', party: '성인 4', status: 'used', channel: '현장 예약', meeting: '성산일출봉 주차장 A구역 · 08:45',
    history: { issued: '11.07 10:00', sent: '11.07 10:01', viewed: '11.07 12:30', used: '11.15 08:52' },
  },
]
