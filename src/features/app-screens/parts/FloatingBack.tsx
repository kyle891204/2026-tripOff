import { cn } from '@/lib/cn'
import { IconBack } from './icons'
import shared from './shared.module.css'
import styles from './FloatingBack.module.css'

interface Props {
  onClick: () => void
  left: number
  top: number
}

/** 앱 화면 안에 떠 있는 뒤로가기 (자체 뒤로 버튼이 없는 화면용) */
export default function FloatingBack({ onClick, left, top }: Props) {
  return (
    <button
      type="button"
      className={cn(styles.button, shared.tappable)}
      style={{ left, top }}
      aria-label="뒤로"
      onClick={onClick}
    >
      <IconBack />
    </button>
  )
}
