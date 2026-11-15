import { Link, useParams } from 'react-router'
import { allTrips, useDemoState } from '@/features/app-screens/store'
import { Container, Section } from '@/components/ui'

export default function InviteLandingPage() {
  const { tripId } = useParams()
  const state = useDemoState()
  const trip = allTrips(state).find(t => t.id === tripId)
  return <Section><Container>
    <h1>{trip ? `${trip.name} 여행에 초대됐어요` : '이 기기에서 여행을 찾을 수 없어요'}</h1>
    <p>{trip ? `${trip.period} · 이 화면은 같은 브라우저에서만 동작하는 시연입니다.` : '새 브라우저에는 이 여행의 시연 데이터가 없어요.'}</p>
    <Link to={trip ? `/demo?trip=${encodeURIComponent(trip.id)}` : '/demo'}>{trip ? '여행 일정 열기' : '기본 시연 열기'}</Link>
  </Container></Section>
}
