import { PARTNER_COMPANY_NAME } from './partnerVouchers'

/** 업체 설정에서 관리하는 업체 프로필. 실제로는 업체 정보 API와 연동한다. */
export interface CompanyProfile {
  name: string
  bizNo: string
  owner: string
  field: string
  manager: string
  phone: string
  email: string
  bank: string
  account: string
  holder: string
  notifications: {
    booking: boolean
    cancel: boolean
    settle: boolean
  }
}

/** 초기값 (시연용 목업). 계좌·사업자번호는 가상 값이다. */
export const PARTNER_COMPANY_INITIAL: CompanyProfile = {
  name: PARTNER_COMPANY_NAME,
  bizNo: '123-45-67890',
  owner: '김현우',
  field: '국내여행 · 투어/액티비티',
  manager: '이수진',
  phone: '064-123-4567',
  email: 'partner@jejuroadtrip.kr',
  bank: '국민은행',
  account: '1234-56-7890123',
  holder: PARTNER_COMPANY_NAME,
  notifications: { booking: true, cancel: true, settle: false },
}
