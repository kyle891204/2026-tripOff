import { cn } from '@/lib/cn'
import { IconChevronRight } from './icons'
import shared from './shared.module.css'
import styles from './InquiryPanel.module.css'

interface Props {
  /** 여행사 일정이면 여행사 이름 */
  agency?: string
  /** 내가 추가한 일정이면 예약처 (Klook 등) */
  provider?: string
  /** 무엇에 대한 문의인지 (예: 「한라산 일출 가이드」 바우처) */
  subject: string
  /** 선택 결과 안내 */
  onDone: (message: string) => void
}

/**
 * 바우처 등록·수정에 문제가 생겼을 때 문의 창구.
 * 여행사 일정 → 여행사 채팅·전화 / 직접 예약 → 예약처 고객센터 / 공통 → TripOff 고객센터(등록 오류 신고)
 */
export default function InquiryPanel({ agency, provider, subject, onDone }: Props) {
  const rows = [
    ...(agency
      ? [
          { title: `${agency}에 채팅 문의`, desc: '평일 09–18시 · 보통 10분 안에 답변', done: `${agency}에 문의를 보냈어요. 답변이 오면 알려드릴게요` },
          { title: `${agency}에 전화`, desc: '064-000-0000', done: `${agency}에 전화를 연결해요 (시연)` },
        ]
      : provider
        ? [{ title: `${provider} 고객센터`, desc: '예약 내역·바우처 재발송 문의', done: `${provider} 고객센터 문의 페이지를 열어요 (시연)` }]
        : []),
    {
      title: 'TripOff 고객센터',
      desc: '바우처가 안 읽히거나 등록 오류가 날 때 · 스크린샷 첨부',
      done: '등록 오류를 신고했어요. 확인 후 알림으로 답변드릴게요',
    },
  ]

  return (
    <div className={styles.panel}>
      <p className={styles.subject}>{subject}</p>
      <ul className={styles.list}>
        {rows.map((r) => (
          <li key={r.title}>
            <button type="button" className={cn(styles.row, shared.tappable)} onClick={() => onDone(r.done)}>
              <span className={styles.text}>
                <strong>{r.title}</strong>
                <span>{r.desc}</span>
              </span>
              <IconChevronRight />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
