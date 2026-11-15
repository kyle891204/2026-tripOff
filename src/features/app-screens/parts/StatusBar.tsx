import airplane from '@/assets/icons/sb-airplane.svg'
import batt from '@/assets/icons/sb-batt.svg'
import battCap from '@/assets/icons/sb-batt-cap.svg'
import battFill from '@/assets/icons/sb-batt-fill.svg'
import sig1 from '@/assets/icons/sb-sig1.svg'
import sig2 from '@/assets/icons/sb-sig2.svg'
import sig3 from '@/assets/icons/sb-sig3.svg'
import sig4 from '@/assets/icons/sb-sig4.svg'
import { cn } from '@/lib/cn'
import styles from './StatusBar.module.css'

interface Props {
  /** 비행기 모드(오프라인) 아이콘 표시 */
  offline?: boolean
  /** 어두운 배경(잠금 화면)용 흰색 */
  light?: boolean
}

/** iOS 상태바 (Figma 좌표: 시간 x32 y21 / 아이콘 x300~352 y24~37) */
export default function StatusBar({ offline, light }: Props) {
  return (
    <div className={cn(styles.bar, light && styles.light)} aria-hidden>
      <span className={styles.time}>9:41</span>
      <span className={styles.icons}>
        {offline ? (
          <img src={airplane} alt="" className={styles.airplane} />
        ) : (
          <span className={styles.signal}>
            <img src={sig1} alt="" />
            <img src={sig2} alt="" />
            <img src={sig3} alt="" />
            <img src={sig4} alt="" />
          </span>
        )}
        <span className={styles.battery}>
          <img src={batt} alt="" className={styles.battOutline} />
          <img src={battFill} alt="" className={styles.battFill} />
          <img src={battCap} alt="" className={styles.battCap} />
        </span>
      </span>
    </div>
  )
}
