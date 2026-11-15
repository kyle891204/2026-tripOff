import { useNavigate, useParams } from 'react-router'
import { SCREEN_BY_ID, type ScreenId } from '@/features/app-screens'
import NotFoundPage from '@/pages/NotFound/NotFoundPage'

/**
 * 앱 화면 하나를 393×852 원본 크기로 단독 렌더 (사이트 헤더/푸터 없음).
 * 발표 자료 캡처, Figma 대조 QA 용. 예: /screens/home
 */
export default function ScreenOnlyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const meta = id ? SCREEN_BY_ID[id as ScreenId] : undefined
  if (!meta) return <NotFoundPage />

  const { Component } = meta
  return <Component go={(next) => navigate(`/screens/${next}`)} back={() => navigate(-1)} />
}
