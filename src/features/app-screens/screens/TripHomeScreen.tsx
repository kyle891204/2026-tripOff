import { cn } from '@/lib/cn'
import QrCode from '../parts/QrCode'
import { SecureQr } from '../parts/Auth'
import Screen from '../parts/Screen'
import { IconAirplaneSmall } from '../parts/icons'
import PlanIcon from '../parts/PlanIcon'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { ME, voucherOf } from '../mock'
import { nextStoredTicket, setDemoState, tripPlans, useCurrentTrip, useDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './TripHomeScreen.module.css'

/** Figma 18:325 「여행 중 홈」 — 오프라인에서도 다음 입장 QR 이 바로 뜸 */
export default function TripHomeScreen({ go }: ScreenProps) {
  const [toast, showToast] = useToast()
  const trip = useCurrentTrip()
  const state = useDemoState()
  const plan = nextStoredTicket(trip, state)
  const entry = plan && voucherOf(plan, trip)
  const next = tripPlans(trip, state).filter(p => p.day >= state.dayIndex && p.id !== plan?.id && (!plan || p.day > plan.day || (p.day === plan.day && p.time >= plan.time))).slice(0, 2)

  return (
    <Screen bg="#fff" offline label="여행 중 홈">
      <button
        type="button"
        className={cn(styles.offline, shared.tappable)}
        onClick={() => showToast(entry ? '기기에 저장된 QR은 인터넷 없이도 열 수 있어요' : '먼저 QR이 있는 바우처를 등록해 주세요')}
      >
        <IconAirplaneSmall />
        오프라인
      </button>

      <p className={styles.eta}>{entry ? `${entry.date} · ${entry.time}` : '여행 지갑'}</p>
      <h1 className={styles.title}>{entry?.title ?? '저장된 QR이 없어요'}</h1>

      {entry && plan ? <button type="button" className={cn(styles.qrCard, shared.tappable)} onClick={() => {
          setDemoState({ planId: plan.id })
          go('ticket')
        }} aria-label="티켓 크게 보기">
        <span className={styles.qrBox}>
          <SecureQr size={257} passive><QrCode value={entry.qrValue} size={257} /></SecureQr>
        </span>
        <span className={styles.notchL} aria-hidden />
        <span className={styles.notchR} aria-hidden />
        <span className={styles.holder}>{ME.name}</span>
        <span className={styles.page}>성인 1매</span>
      </button> : <button type="button" className={cn(shared.cta, shared.ctaTeal, shared.tappable)} onClick={() => go('timeline')}>일정에서 바우처 추가</button>}

      <p className={styles.next}>이어서</p>
      <ul className={styles.list}>
        {next.map((n) => (
          <li key={n.id}>
            <button type="button" className={cn(styles.nextRow, shared.tappable)} onClick={() => go('timeline')}>
              <PlanIcon kind={n.icon} />
              <span className={styles.text}>
                <strong>{n.title}</strong>
                <span>{n.time}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {toast}
    </Screen>
  )
}
