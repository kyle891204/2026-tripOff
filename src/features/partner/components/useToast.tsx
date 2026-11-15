import { useEffect, useState } from 'react'
import s from '../partner.module.css'

/** 화면 아래에 잠깐 떴다 사라지는 확인 메시지 */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(() => setMessage(null), 2400)
    return () => window.clearTimeout(id)
  }, [message])
  const node = message ? (
    <div className={s.toast} role="status">
      {message}
    </div>
  ) : null
  return { show: setMessage, node }
}
