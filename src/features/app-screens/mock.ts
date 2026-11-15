/** 시연 시나리오 데이터 (Figma 하이파이 화면 문구 그대로) */
import type { AvatarTone } from './parts/Avatar'

export const TRIP = {
  city: '오사카',
  period: '6.12 금 ~ 6.15 월',
  dday: 'D-5',
  tickets: 6,
}

export interface Member {
  name: string
  label: string
  tone: AvatarTone
  me?: boolean
  status: string
  pending?: boolean
}

export const MEMBERS: Member[] = [
  { name: '김용태', label: '용', tone: 'coral', me: true, status: '티켓 6' },
  { name: '이석민', label: '석', tone: 'teal', status: '티켓 6' },
  { name: '박지성', label: '지', tone: 'sand', status: '수락 대기', pending: true },
]

export const VOUCHER = {
  provider: 'Klook',
  title: '유니버설 스튜디오 재팬',
  file: 'USJ_입장권.pdf',
  date: '6.12 금',
  wrongTime: '04:00',
  time: '14:00',
  code: 'KLK-DEMO-0612',
  people: '3명',
  qrValue: 'TRIPOFF-DEMO-KLK-0612',
}
