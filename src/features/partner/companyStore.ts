import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { PARTNER_COMPANY_INITIAL, type CompanyProfile } from '@/data/partnerCompany'

/** 업체 설정을 사이드바·대시보드·바우처 미리보기와 공유한다. */
const STORAGE_KEY = 'tripoff.partner.company'

interface CompanyStore {
  company: CompanyProfile
  setCompany: Dispatch<SetStateAction<CompanyProfile>>
}

export const CompanyStoreContext = createContext<CompanyStore | null>(null)

export function loadPartnerCompany(): CompanyProfile {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return { ...PARTNER_COMPANY_INITIAL, ...(JSON.parse(raw) as Partial<CompanyProfile>) }
  } catch {
    // 저장소를 못 쓰는 환경이면 초기값으로 시작
  }
  return PARTNER_COMPANY_INITIAL
}

export function useCompanyStoreValue(): CompanyStore {
  const [company, setCompany] = useState<CompanyProfile>(loadPartnerCompany)
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(company))
    } catch {
      // 저장 실패는 시연에 영향 없음
    }
  }, [company])
  return useMemo(() => ({ company, setCompany }), [company])
}

export function useCompany(): CompanyStore {
  const store = useContext(CompanyStoreContext)
  if (!store) throw new Error('useCompany는 PartnerLayout 안에서만 쓸 수 있어요.')
  return store
}
