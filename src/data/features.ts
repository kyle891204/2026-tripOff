import type { Feature } from '@/types/content'

export const FEATURES: Feature[] = [
  { id: 'collect', icon: '🎫', title: '바우처를 한곳에', description: 'PDF, 메일, 캡처 어디서 받은 예약이든 공유 한 번으로 여행 지갑에 모여요.' },
  { id: 'review', icon: '🔍', title: '틀린 정보는 잡아내고', description: '추출한 날짜·시간·예약번호를 원본과 비교해, 다른 값은 바로 알려줘요.' },
  { id: 'timeline', icon: '🗓️', title: '하루 일정으로 합쳐서', description: '흩어진 예약이 타임라인 하나로. 겹치는 일정은 미리 경고해요.' },
  { id: 'offline', icon: '📴', title: '현장에선 오프라인으로', description: '데이터가 끊겨도 입장 QR 이 바로. 잠금화면 위젯에서도 꺼낼 수 있어요.' },
]
