import { cn } from '@/lib/cn'
import Avatar from '../parts/Avatar'
import Screen from '../parts/Screen'
import { IconBack } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { MEMBERS } from '../mock'
import type { ScreenProps } from '../types'
import styles from './CompanionsScreen.module.css'

const COSTS = [
  { label: '숙소', amount: '₩312,000', width: 168, tone: 'var(--teal)' },
  { label: '입장권', amount: '₩193,500', width: 104, tone: 'var(--teal-mid)' },
  { label: '교통', amount: '₩47,400', width: 33, tone: 'var(--sand)' },
]

const INVITE_LINK = 'tripoff.app/j/8KQ2'

/** Figma 18:410 「동행 · 정산」 */
export default function CompanionsScreen({ back }: ScreenProps) {
  const [toast, showToast] = useToast()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${INVITE_LINK}`)
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

      <h1 className={styles.title}>함께 가는 사람</h1>

      <ul className={styles.people}>
        {MEMBERS.map((m) => (
          <li key={m.name} className={styles.person}>
            <button
              type="button"
              className={cn(styles.personBtn, shared.tappable)}
              onClick={() =>
                showToast(m.pending ? `${m.name}님에게 초대 알림을 다시 보냈어요` : `${m.name}님과 티켓을 함께 보고 있어요`)
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
      </ul>

      <section className={styles.split} aria-label="정산">
        <p className={styles.per}>1인당</p>
        <p className={styles.amount}>₩184,300</p>
        <div className={styles.bars} aria-hidden>
          {COSTS.map((c) => (
            <span key={c.label} style={{ width: c.width, background: c.tone }} />
          ))}
        </div>
        <div className={styles.legend}>
          {COSTS.map((c) => (
            <span key={c.label}>
              {c.label} {c.amount}
            </span>
          ))}
        </div>
      </section>

      <div className={styles.link}>
        <span>{INVITE_LINK}</span>
        <button type="button" className={cn(styles.copy, shared.tappable)} onClick={copy}>
          복사
        </button>
      </div>

      <button
        type="button"
        className={cn(shared.cta, shared.ctaInk, shared.tappable)}
        onClick={() => showToast('카카오톡으로 초대 링크를 보냈어요')}
      >
        초대 링크 보내기
      </button>

      {toast}
    </Screen>
  )
}
