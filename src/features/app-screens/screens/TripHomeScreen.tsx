import { cn } from '@/lib/cn'
import QrCode from '../parts/QrCode'
import Screen from '../parts/Screen'
import { IconAirplaneSmall, IconBus, IconShip } from '../parts/icons'
import shared from '../parts/shared.module.css'
import { useToast } from '../parts/useToast'
import { ME, NEXT_ENTRY } from '../mock'
import { setDemoState } from '../store'
import type { ScreenProps } from '../types'
import styles from './TripHomeScreen.module.css'

const NEXT = [
  { icon: <IconBus />, title: '난바행 셔틀', time: '14:20' },
  { icon: <IconShip />, title: '도톤보리 리버 크루즈', time: '18:30' },
]

/** Figma 18:325 「여행 중 홈」 — 오프라인에서도 다음 입장 QR 이 바로 뜸 */
export default function TripHomeScreen({ go }: ScreenProps) {
  const [toast, showToast] = useToast()

  return (
    <Screen bg="#fff" offline label="여행 중 홈">
      <button
        type="button"
        className={cn(styles.offline, shared.tappable)}
        onClick={() => showToast('인터넷 없이도 티켓 6장을 모두 볼 수 있어요')}
      >
        <IconAirplaneSmall />
        오프라인
      </button>

      <p className={styles.eta}>30분 후</p>
      <h1 className={styles.title}>{NEXT_ENTRY.title}</h1>

      <button type="button" className={cn(styles.qrCard, shared.tappable)} onClick={() => {
          setDemoState({ planId: undefined })
          go('ticket')
        }} aria-label="티켓 크게 보기">
        <span className={styles.qrBox}>
          <QrCode value={NEXT_ENTRY.qrValue} size={257} />
        </span>
        <span className={styles.notchL} aria-hidden />
        <span className={styles.notchR} aria-hidden />
        <span className={styles.holder}>{ME.name}</span>
        <span className={styles.page}>성인 1매</span>
      </button>

      <p className={styles.next}>이어서</p>
      <ul className={styles.list}>
        {NEXT.map((n) => (
          <li key={n.title}>
            <button type="button" className={cn(styles.nextRow, shared.tappable)} onClick={() => go('timeline')}>
              <span className={shared.iconBox}>{n.icon}</span>
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
