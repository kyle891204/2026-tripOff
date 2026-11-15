/**
 * 시연 시나리오 데이터.
 * - 여행은 여러 개 (오사카: 내가 모은 바우처 / 제주: 여행사가 보낸 일정 + 내가 추가한 일정)
 * - 티켓은 "나(김용태)" 것만. 동행은 각자 자기 앱에서 자기 QR 만 본다.
 * - 제주 여행사 이름·상품은 파트너센터 목 데이터(src/data/partnerVouchers.ts)와 맞춤.
 */
import { PARTNER_COMPANY_NAME } from '@/data/partnerVouchers'
import type { AvatarTone } from './parts/Avatar'
import type { ScreenId } from './types'

export const ME = { name: '김용태', label: '용' }

export interface Member {
  name: string
  label: string
  tone: AvatarTone
  me?: boolean
  /** 본인이 받은 티켓 수 (남의 티켓은 보이지 않음) */
  status: string
  pending?: boolean
}

export const MEMBERS: Member[] = [
  { name: '김용태', label: '용', tone: 'coral', me: true, status: '티켓 7' },
  { name: '이석민', label: '석', tone: 'teal', status: '티켓 7' },
  { name: '박지성', label: '지', tone: 'sand', status: '수락 대기', pending: true },
]

/* ------------------------------------------------------------------ */

export type PlanIcon = 'plane' | 'bus' | 'bed' | 'ship' | 'ticket'

/** 일정의 출처: 여행사가 보낸 것 / 내가 직접 추가한 것 */
export type PlanSource = { kind: 'agency'; name: string } | { kind: 'self'; via: string }

export interface Plan {
  id: string
  /** TripDay 인덱스 */
  day: number
  time: string
  title: string
  icon: PlanIcon
  source: PlanSource
  /** 출처 뒤에 붙는 짧은 설명 (예: '내 QR', '집결 성산항') */
  note?: string
  /** 일정 겹침 (타임라인 coral 강조) */
  conflict?: boolean
  /** 바로 아래에 겹침 경고 표시 */
  warnAfter?: { text: string; detail: string }
  /** 이 일정을 누르면 갈 화면 (없으면 안내 토스트) */
  to?: ScreenId
  /** 「바우처 추가」 시연 샘플로 저장되는 일정. 오사카는 원래 보임(Figma), 제주는 저장해야 나타남 */
  sample?: 'always' | 'after-save'
}

export interface TripDay {
  dow: string
  date: number
}

/** 「바우처 추가 → 추출 결과 확인」 시연 샘플 */
export interface SampleVoucher {
  provider: string
  title: string
  file: string
  date: string
  wrongTime: string
  time: string
  code: string
  people: string
  qrValue: string
}

export interface Trip {
  id: 'osaka' | 'jeju'
  city: string
  period: string
  /** 카드 상단 월 표기 (예: 6.12 금) */
  month: number
  dday: string
  /** 카드 배경 */
  tone: 'deep' | 'teal'
  days: TripDay[]
  plans: Plan[]
  sample: SampleVoucher
}

export const TRIPS: Trip[] = [
  {
    id: 'osaka',
    city: '오사카',
    period: '6.12 금 ~ 6.15 월',
    month: 6,
    dday: 'D-5',
    tone: 'deep',
    days: [
      { dow: '금', date: 12 },
      { dow: '토', date: 13 },
      { dow: '일', date: 14 },
      { dow: '월', date: 15 },
    ],
    plans: [
      { id: 'o1', day: 0, time: '09:10', title: '인천 → 간사이', icon: 'plane', source: { kind: 'self', via: '항공사 직접 예약' } },
      {
        id: 'o2', day: 0, time: '14:00', title: '유니버설 스튜디오 재팬', icon: 'ticket', source: { kind: 'self', via: 'Klook' },
        note: '내 QR', conflict: true, to: 'trip-home', sample: 'always',
        warnAfter: { text: '관람 중 셔틀 출발', detail: 'USJ 입장(14:00) 20분 뒤에 셔틀이 출발해요' },
      },
      { id: 'o3', day: 0, time: '14:20', title: '난바행 셔틀', icon: 'bus', source: { kind: 'self', via: '교통 예약처' }, conflict: true },
      { id: 'o4', day: 0, time: '18:30', title: '도톤보리 리버 크루즈', icon: 'ship', source: { kind: 'self', via: 'KKday' }, note: '내 QR', to: 'ticket' },
      { id: 'o5', day: 1, time: '09:30', title: '교토행 셔틀', icon: 'bus', source: { kind: 'self', via: '교통 예약처' } },
      { id: 'o6', day: 1, time: '13:00', title: '호즈강 뱃놀이', icon: 'ship', source: { kind: 'self', via: 'KKday' }, note: '내 QR', to: 'ticket' },
      { id: 'o7', day: 2, time: '11:00', title: '가이유칸 수족관', icon: 'ticket', source: { kind: 'self', via: 'Klook' }, note: '내 QR', to: 'ticket' },
      { id: 'o8', day: 3, time: '18:40', title: '간사이 → 인천', icon: 'plane', source: { kind: 'self', via: '항공사 직접 예약' } },
    ],
    sample: {
      provider: 'Klook',
      title: '유니버설 스튜디오 재팬',
      file: 'USJ_입장권.pdf',
      date: '6.12 금',
      wrongTime: '04:00',
      time: '14:00',
      code: 'KLK-DEMO-0612',
      people: '3명',
      qrValue: 'TRIPOFF-DEMO-KLK-0612-YT',
    },
  },
  {
    id: 'jeju',
    city: '제주',
    period: '6.26 금 ~ 6.28 일',
    month: 6,
    dday: 'D-19',
    tone: 'teal',
    days: [
      { dow: '금', date: 26 },
      { dow: '토', date: 27 },
      { dow: '일', date: 28 },
    ],
    plans: [
      { id: 'j1', day: 0, time: '08:30', title: '김포 → 제주', icon: 'plane', source: { kind: 'self', via: '항공사 직접 예약' } },
      {
        id: 'j2', day: 0, time: '09:00', title: '제주 동부 오름 트레킹', icon: 'ticket',
        source: { kind: 'agency', name: PARTNER_COMPANY_NAME }, note: '집결 성산일출봉 08:45', to: 'ticket',
      },
      { id: 'j3', day: 0, time: '15:00', title: '오션뷰 스테이 체크인', icon: 'bed', source: { kind: 'self', via: '숙소 예약 메일' } },
      {
        id: 'j4', day: 1, time: '09:30', title: '우도 전기자전거 투어', icon: 'ship',
        source: { kind: 'agency', name: PARTNER_COMPANY_NAME }, note: '성산항 2번 창구', to: 'ticket',
      },
      { id: 'j5', day: 1, time: '15:00', title: '카멜리아힐', icon: 'ticket', source: { kind: 'self', via: 'Klook' }, note: '내 QR', sample: 'after-save' },
      { id: 'j6', day: 2, time: '17:40', title: '제주 → 김포', icon: 'plane', source: { kind: 'self', via: '항공사 직접 예약' } },
    ],
    sample: {
      provider: 'Klook',
      title: '카멜리아힐',
      file: '카멜리아힐_입장권.pdf',
      date: '6.27 토',
      wrongTime: '05:00',
      time: '15:00',
      code: 'KLK-DEMO-0627',
      people: '3명',
      qrValue: 'TRIPOFF-DEMO-KLK-0627-YT',
    },
  },
]

export const TRIP_BY_ID = Object.fromEntries(TRIPS.map((t) => [t.id, t])) as Record<Trip['id'], Trip>

/** 「여행 중」 화면·티켓·잠금 위젯에서 쓰는 다음 입장 (오사카 USJ, 내 티켓 1매) */
export const NEXT_ENTRY = {
  title: '유니버설 스튜디오 재팬',
  time: '14:00',
  code: 'DEMO-0612',
  gate: '메인',
  qrValue: TRIPS[0].sample.qrValue,
}

/** 출처 한 줄 표기: 「제주로드트립 발송 · 집결 …」 / 「Klook · 내 QR」 */
export function sourceLine(p: Plan) {
  const head = p.source.kind === 'agency' ? `${p.source.name} 발송` : p.source.via
  return p.note ? `${head} · ${p.note}` : head
}

/** 일정이 지금 보여야 하는지 (제주 샘플은 저장 후에만) */
export function isVisible(p: Plan, saved: boolean) {
  return p.sample !== 'after-save' || saved
}
