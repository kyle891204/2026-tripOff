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
  /**
   * 바우처 상태. 기본은 첨부됨.
   * 'missing' = 여행사가 일정만 보내고 바우처는 안 보냄 → 사용자가 직접 등록
   */
  voucher?: 'missing'
  /** 사용자가 고친 바우처 값 (없으면 자동 생성) */
  code?: string
  people?: string
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
  id: string
  /** 여행 이름 (사용자가 정함. 예: 오사카, 도쿄 먹방 여행) */
  name: string
  /** 여행 기간 (YYYY-MM-DD) */
  startIso: string
  endIso: string
  period: string
  /** 카드 상단 월 표기 (예: 6.12 금) */
  month: number
  dday: string
  /** 카드 배경 */
  tone: 'deep' | 'teal'
  days: TripDay[]
  plans: Plan[]
  sample: SampleVoucher
  /** 함께 가는 사람 (새로 만든 여행은 나 혼자) */
  members: Member[]
}

export const TRIPS: Trip[] = [
  {
    id: 'osaka',
    name: '오사카',
    startIso: '2026-06-12',
    endIso: '2026-06-15',
    period: '6.12 금 ~ 6.15 월',
    month: 6,
    dday: 'D-5',
    tone: 'deep',
    members: MEMBERS,
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
    name: '제주',
    startIso: '2026-06-26',
    endIso: '2026-06-28',
    period: '6.26 금 ~ 6.28 일',
    month: 6,
    dday: 'D-19',
    tone: 'teal',
    members: MEMBERS,
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
      {
        id: 'j7', day: 2, time: '03:30', title: '한라산 일출 가이드', icon: 'ticket',
        source: { kind: 'agency', name: PARTNER_COMPANY_NAME }, note: '성판악 탐방안내소', voucher: 'missing',
      },
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

/* ---------------------------- 새 여행 만들기 ---------------------------- */

/** 시연 기준 오늘 (오사카 D-5 → 6월 7일) */
export const DEMO_TODAY = '2026-06-07'

const DOW = ['일', '월', '화', '수', '목', '금', '토']
const DAY_MS = 86_400_000

/** 'YYYY-MM-DD' → 현지 자정 Date (시간대 영향 없이) */
function parseDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const fmt = (d: Date) => `${d.getMonth() + 1}.${d.getDate()} ${DOW[d.getDay()]}`

/** 새 여행에 붙는 「바우처 추가」 시연 샘플 */
function genericSample(first: Date): SampleVoucher {
  return {
    provider: 'Klook',
    title: '시티 워킹 투어',
    file: '시티워킹투어_바우처.pdf',
    date: fmt(first),
    wrongTime: '02:00',
    time: '10:00',
    code: 'KLK-DEMO-NEW',
    people: '1명',
    qrValue: `TRIPOFF-DEMO-${first.getTime()}`,
  }
}

/** 입력한 여행 이름·날짜로 빈 여행 만들기 (일정은 바우처를 추가하며 채움) */
export function makeTrip(name: string, startIso: string, endIso: string, order: number): Trip {
  const start = parseDate(startIso)
  const end = parseDate(endIso < startIso ? startIso : endIso)
  const count = Math.min(14, Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1)
  const days = Array.from({ length: count }, (_, i) => {
    const d = new Date(start.getTime() + i * DAY_MS)
    return { dow: DOW[d.getDay()], date: d.getDate() }
  })
  const dday = Math.round((start.getTime() - parseDate(DEMO_TODAY).getTime()) / DAY_MS)
  const sample = genericSample(start)
  return {
    id: `trip-${start.getTime()}-${order}`,
    name,
    startIso,
    endIso: endIso < startIso ? startIso : endIso,
    period: `${fmt(start)} ~ ${fmt(end)}`,
    month: start.getMonth() + 1,
    dday: dday > 0 ? `D-${dday}` : dday === 0 ? 'D-DAY' : '여행 중',
    tone: order % 2 === 0 ? 'deep' : 'teal',
    days,
    members: [MEMBERS[0]],
    plans: [
      // 저장 전엔 숨어 있다가 「바우처 추가」 시연으로 저장하면 첫날에 나타남
      { id: `${start.getTime()}-s`, day: 0, time: sample.time, title: sample.title, icon: 'ticket', source: { kind: 'self', via: 'Klook' }, note: '내 QR', sample: 'after-save' },
    ],
    sample,
  }
}

/** 「여행 중」 화면·티켓·잠금 위젯에서 쓰는 다음 입장 (오사카 USJ, 내 티켓 1매) */
export const NEXT_ENTRY = {
  title: '유니버설 스튜디오 재팬',
  time: '14:00',
  code: 'DEMO-0612',
  gate: '메인',
  qrValue: TRIPS[0].sample.qrValue,
}

/** 출처 한 줄 표기: 「제주로드트립 · 집결 …」 / 「Klook · 내 QR」 */
export function sourceLine(p: Plan) {
  const head = p.source.kind === 'agency' ? p.source.name : p.source.via
  return p.note ? `${head} · ${p.note}` : head
}

/** 일정이 지금 보여야 하는지 (제주 샘플은 저장 후에만) */
export function isVisible(p: Plan, saved: boolean) {
  return p.sample !== 'after-save' || saved
}

/* ------------------------------ 바우처 ------------------------------ */

/** 일정에 붙은 바우처 내용 (상세·수정 화면에서 표시) */
export interface VoucherInfo {
  provider: string
  title: string
  file: string
  date: string
  time: string
  code: string
  people: string
  qrValue: string
}

/** 일정 → 바우처 내용 (시연용으로 일정 정보에서 만들어 냄) */
export function voucherOf(plan: Plan, trip: Trip): VoucherInfo {
  const day = trip.days[plan.day]
  const provider = plan.source.kind === 'agency' ? plan.source.name : plan.source.via
  const short = plan.id.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return {
    provider,
    title: plan.title,
    file: `${plan.title.replace(/\s+/g, '_')}_바우처.pdf`,
    date: `${trip.month}.${day.date} ${day.dow}`,
    time: plan.time,
    code: plan.code ?? `DEMO-${short}-${trip.month}${String(day.date).padStart(2, '0')}`,
    people: plan.people ?? '성인 1매',
    qrValue: `TRIPOFF-DEMO-${trip.id}-${plan.id}`,
  }
}

/** 출처 사람이 읽는 표현: 「제주로드트립에서 보낸 일정」 / 「Klook 예약 · 내가 추가」 */
export function sourceLabel(plan: Plan) {
  return plan.source.kind === 'agency' ? `${plan.source.name}에서 보낸 일정` : `${plan.source.via} · 내가 추가`
}
