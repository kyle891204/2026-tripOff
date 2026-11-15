import { cn } from '@/lib/cn'
import Avatar from '../parts/Avatar'
import Screen from '../parts/Screen'
import { IconBack } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { useCurrentTrip } from '../store'
import type { ScreenProps } from '../types'
import styles from './CompanionsScreen.module.css'

/** 여행별 정산·초대 링크 (오사카는 Figma 값) */
const BY_TRIP: Record<string, { perPerson: string; link: string; costs: Array<{ label: string; amount: string; width: number; tone: string }> }> = {
  osaka: {
    perPerson: '₩184,300',
    link: 'tripoff.app/j/8KQ2',
    costs: [
      { label: '숙소', amount: '₩312,000', width: 168, tone: 'var(--teal)' },
      { label: '입장권', amount: '₩193,500', width: 104, tone: 'var(--teal-mid)' },
      { label: '교통', amount: '₩47,400', width: 33, tone: 'var(--sand)' },
    ],
  },
  jeju: {
    perPerson: '₩126,000',
    link: 'tripoff.app/j/3JD7',
    costs: [
      { label: '숙소', amount: '₩180,000', width: 150, tone: 'var(--teal)' },
      { label: '여행사 투어', amount: '₩138,000', width: 115, tone: 'var(--deep)' },
      { label: '입장권', amount: '₩60,000', width: 40, tone: 'var(--sand)' },
    ],
  },
}

/** Figma 18:410 「동행 · 정산」 — 여행 단위. 초대 링크도 이 여행으로 초대 */
export default function CompanionsScreen({ back }: ScreenProps) {
  const [toast, showToast] = useToast()
  const trip = useCurrentTrip()
  // 새로 만든 여행: 아직 정산할 비용 없음
  const { perPerson, link, costs } = BY_TRIP[trip.id] ?? { perPerson: '₩0', link: `tripoff.app/j/${trip.id.slice(-4).toUpperCase()}`, costs: [] }
  
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${link}`)
    } catch {
      // 권한 없는 환경(미리보기 등)에서도 시연은 계속
    }
    showToast('초대 링크를 복사했어요')
  }

  return (
    <Screen bg="var(--mist)" label="동행 · 정산">
      <button type="button" className={shared.back} aria-label="뒤로" onClick={back}>
        <IconBack />
      </button>

      <p className={styles.trip}>
        {trip.city} 여행 · {trip.period}
      </p>
      <h1 className={styles.title}>함께 가는 사람</h1>

      <ul className={styles.people}>
        {trip.members.map((m) => (
          <li key={m.name} className={styles.person}>
            <button
              type="button"
              className={cn(styles.personBtn, shared.tappable)}
              onClick={() =>
                showToast(m.pending ? `${m.name}님에게 초대 알림을 다시 보냈어요` : m.me ? '내 티켓은 나만 볼 수 있어요' : `${m.name}님 티켓은 ${m.name}님 앱에서만 보여요`)
              }
            >
            <Avatar
              label={m.label}
              name={m.name}
              tone={m.pending ? 'off' : m.tone}
              size={40}
              fontSize={19}
              ring={{ width: 2.5, color: '#fff' }}
            />
            <span className={cn(styles.name, m.pending && styles.muted)}>{m.name}</span>
            {m.me && <span className={styles.me}>나</span>}
            <span className={cn(styles.status, m.pending && styles.pending)}>{m.status}</span>
            </button>
          </li>
        ))}
        {trip.members.length === 1 && <li className={styles.alone}>아직 함께 가는 사람이 없어요. 아래 링크로 초대해 보세요</li>}
      </ul>

      <section className={styles.split} aria-label="정산">
        <p className={styles.per}>1인당</p>
        <p className={styles.amount}>{perPerson}</p>
        <div className={styles.bars} aria-hidden>
          {costs.map((c) => (
            <span key={c.label} style={{ width: c.width, background: c.tone }} />
          ))}
        </div>
        <div className={styles.legend}>
          {costs.map((c) => (
            <span key={c.label}>
              {c.label} {c.amount}
            </span>
          ))}
        </div>
      </section>

      <div className={styles.link}>
        <span>{link}</span>
        <button type="button" className={cn(styles.copy, shared.tappable)} onClick={copy}>
          복사
        </button>
      </div>

      <button
        type="button"
        className={cn(shared.cta, shared.ctaInk, shared.tappable)}
        onClick={() => showToast(`${trip.city} 여행 초대 링크를 카카오톡으로 보냈어요`)}
      >
        {trip.city} 여행에 초대하기
      </button>

      {toast}
    </Screen>
  )
}
