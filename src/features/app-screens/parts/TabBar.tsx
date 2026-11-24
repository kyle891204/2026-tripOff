import { cn } from '@/lib/cn'
import { setDemoState } from '../store'
import type { ScreenId, ScreenProps } from '../types'
import styles from './TabBar.module.css'

export type TabId = 'home' | 'shop' | 'vouchers' | 'profile'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: '홈', icon: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { id: 'shop', label: '여행 발견', icon: 'M4 8h16l-1.2 11.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9zM8.5 8V6.5a3.5 3.5 0 0 1 7 0V8' },
  { id: 'vouchers', label: '일정', icon: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 10h18M8 3v4M16 3v4' },
  { id: 'profile', label: '마이페이지', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m-7.5 9a7.5 7.5 0 0 1 15 0' },
]

/** 하단 탭 바 (홈 · 여행 발견 · 일정 · 마이페이지). 탭 화면 사이 이동은 방문 기록에 남기지 않음 */
export default function TabBar({ active, go, inside }: {
  active: TabId
  go: ScreenProps['go']
  /** 탭의 하위 화면(예: 홈 → 여행 타임라인)이면 같은 탭을 눌러 첫 화면으로 */
  inside?: boolean
}) {
  const open = (id: TabId) => {
    if (id === active && !inside) return
    if (id === 'shop') setDemoState({ shopCountry: undefined, shopDestination: undefined })
    go(id as ScreenId, { replace: true })
  }

  return (
    <nav className={styles.bar} aria-label="주요 메뉴">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={cn(styles.tab, t.id === active && styles.on)}
          aria-current={t.id === active && !inside ? 'page' : undefined}
          onClick={() => open(t.id)}
          data-tap={'go:' + t.id}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={t.icon} />
          </svg>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
