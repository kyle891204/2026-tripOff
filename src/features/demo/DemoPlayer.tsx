import { useCallback, useState } from 'react'
import { SCREENS, SCREEN_BY_ID, type ScreenId } from '@/features/app-screens'
import { cn } from '@/lib/cn'
import PhoneFrame from './PhoneFrame'
import styles from './DemoPlayer.module.css'

interface Nav {
  /** 현재 화면 */
  current: ScreenId
  /** 지나온 화면들 (뒤로가기용) */
  history: ScreenId[]
  toast?: string
  /** 같은 화면으로 다시 가도 애니메이션이 다시 돌도록 key 갱신 */
  nonce: number
}

const START: ScreenId = 'splash'

/**
 * 시연 플레이어: 폰 안에서 직접 눌러 흐름대로 이동하거나,
 * 오른쪽 목록에서 원하는 화면으로 바로 점프.
 * 폰 위 플로팅 바: 뒤로 / 처음부터.
 */
export default function DemoPlayer() {
  const [nav, setNav] = useState<Nav>({ current: START, history: [], nonce: 0 })

  const go = useCallback((id: ScreenId) => {
    setNav((n) => ({
      current: id,
      // 스플래시는 뒤로가기 대상에서 제외 (자동으로 지나가는 화면)
      history: n.current === 'splash' ? n.history : [...n.history, n.current],
      // 추출 결과에서 저장 → 타임라인: 로우파이 「05 수정 후 저장」을 토스트로 대신 표현
      toast: n.current === 'review' && id === 'timeline' ? '입장 시간을 14:00으로 저장했어요' : undefined,
      nonce: n.nonce + 1,
    }))
  }, [])

  const back = useCallback(() => {
    setNav((n) => ({
      current: n.history.at(-1) ?? 'home',
      history: n.history.slice(0, -1),
      nonce: n.nonce + 1,
    }))
  }, [])

  const restart = () => setNav((n) => ({ current: START, history: [], nonce: n.nonce + 1 }))

  const meta = SCREEN_BY_ID[nav.current]
  const { Component } = meta
  const index = SCREENS.findIndex((s) => s.id === nav.current)
  const canBack = nav.history.length > 0

  return (
    <div className={styles.root}>
      <div className={styles.stage}>
        {/* 플로팅 바: 폰 화면 디자인을 가리지 않도록 폰 바깥 위에 */}
        <div className={styles.toolbar}>
          <button type="button" className={styles.tool} onClick={back} disabled={!canBack}>
            <span aria-hidden>←</span> 뒤로
          </button>
          <span className={styles.where}>{meta.title}</span>
          <button type="button" className={styles.tool} onClick={restart}>
            <span aria-hidden>↻</span> 처음부터
          </button>
        </div>
        <PhoneFrame>
          <Component key={nav.nonce} go={go} back={back} toast={nav.toast} />
        </PhoneFrame>
      </div>

      <div className={styles.side}>
        <p className={styles.step}>
          {String(index + 1).padStart(2, '0')} / {String(SCREENS.length).padStart(2, '0')}
        </p>
        <h2 className={styles.title}>
          {meta.title}
          {meta.source === 'temp' && <span className={styles.temp}>임시 화면</span>}
        </h2>
        <p className={styles.caption}>{meta.caption}</p>

        <ol className={styles.list}>
          {SCREENS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={cn(styles.item, s.id === nav.current && styles.active)}
                onClick={() => go(s.id)}
              >
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                {s.title}
                {s.source === 'temp' && <span className={styles.tempDot} title="하이파이 없음" />}
              </button>
            </li>
          ))}
        </ol>

        <div className={styles.nav}>
          <button type="button" disabled={index <= 0} onClick={() => go(SCREENS[index - 1].id)}>
            이전 화면
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={index >= SCREENS.length - 1}
            onClick={() => go(SCREENS[index + 1].id)}
          >
            다음 화면
          </button>
        </div>
        <p className={styles.hint}>폰 화면 안의 버튼·카드·탭도 모두 눌러 보세요.</p>
      </div>
    </div>
  )
}
