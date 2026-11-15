import { useLayoutEffect, useRef, type ReactNode } from 'react'
import styles from './PhoneFrame.module.css'

/**
 * 393×852 앱 화면을 축소해서 보여주는 틀 (베젤 없이 둥근 화면 + 그림자만).
 * 크기는 PhoneFrame.module.css 의 --w / --h / --scale 로 조절.
 */
export default function PhoneFrame({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    // 고정 좌표의 시연 화면을 모바일 뷰포트 양쪽 끝에 맞춥니다.
    const update = () => {
      const { width, height } = frame.getBoundingClientRect()
      if (!width || !height) return
      const x = width / 393
      const y = height / 852
      const square = Math.min(x, y)
      frame.style.setProperty('--mobile-scale-x', String(x))
      frame.style.setProperty('--mobile-scale-y', String(y))
      frame.style.setProperty('--qr-scale-x', String(square / x))
      frame.style.setProperty('--qr-scale-y', String(square / y))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.frame} ref={frameRef}>
      <div className={styles.canvas}>{children}</div>
    </div>
  )
}
