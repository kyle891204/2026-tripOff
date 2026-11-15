import { useState } from 'react'
import type { DemoScreen } from '@/types/content'
import { cn } from '@/lib/cn'
import PhoneFrame from './PhoneFrame'
import styles from './ScreenViewer.module.css'

interface Props {
  screens: DemoScreen[]
}

/** 탭으로 앱 화면을 전환하며 보여주는 시연 뷰어 */
export default function ScreenViewer({ screens }: Props) {
  const [activeId, setActiveId] = useState(screens[0]?.id)
  const active = screens.find((s) => s.id === activeId) ?? screens[0]

  if (!active) return null

  return (
    <div className={styles.root}>
      <PhoneFrame>
        {active.image ? (
          <img src={active.image} alt={active.title} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>{active.title} 화면</div>
        )}
      </PhoneFrame>

      <div className={styles.side}>
        <ul className={styles.tabs}>
          {screens.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={cn(styles.tab, s.id === active.id && styles.tabActive)}
                onClick={() => setActiveId(s.id)}
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
        <p className={styles.caption}>{active.caption}</p>
      </div>
    </div>
  )
}
