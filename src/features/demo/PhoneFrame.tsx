import { useLayoutEffect, useRef, type ReactNode } from 'react'
import styles from './PhoneFrame.module.css'

/**
 * 393×852 앱 화면을 축소해서 보여주는 틀 (베젤 없이 둥근 화면 + 그림자만).
 * 크기는 PhoneFrame.module.css 의 --w / --h / --scale 로 조절.
 */
export default function PhoneFrame({ children, immersive = false, screenKey, showBottom = false }: {
  children: ReactNode
  immersive?: boolean
  screenKey?: number
  showBottom?: boolean
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame || !immersive) return
    // 좁은 창에서는 줄이고, 넓어져도 393px 디자인 크기 이상 키우지 않습니다.
    const update = () => {
      if (window.innerWidth > 767) {
        const desktopHeight = Math.min(852, Math.max(320, window.innerHeight - 88))
        frame.style.setProperty('--w', String(desktopHeight * 393 / 852))
        frame.style.setProperty('--h', String(desktopHeight))
      }
      const { width, height } = frame.getBoundingClientRect()
      if (!width || !height) return
      const scale = Math.min(width / 393, 1)
      const contentHeight = Math.max(852, height / scale)
      frame.style.setProperty('--mobile-scale', String(scale))
      frame.style.setProperty('--mobile-content-height', `${contentHeight}px`)
      frame.style.setProperty('--mobile-scroll-height', `${Math.max(height, contentHeight * scale)}px`)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(frame)
    window.addEventListener('resize', update)
    return () => { observer.disconnect(); window.removeEventListener('resize', update) }
  }, [immersive])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (immersive && viewport) viewport.scrollTop = showBottom ? viewport.scrollHeight : 0
  }, [immersive, screenKey, showBottom])

  return (
    <div className={immersive ? `${styles.frame} ${styles.immersive}` : styles.frame} ref={frameRef}>
      <div className={styles.viewport} ref={viewportRef}>
        <div className={styles.sizer}>
          <div className={styles.canvas}>{children}</div>
        </div>
      </div>
    </div>
  )
}
