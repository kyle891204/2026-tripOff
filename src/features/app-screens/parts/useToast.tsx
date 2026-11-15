import { useCallback, useState } from 'react'
import shared from './shared.module.css'

/**
 * 화면 안에서 띄우는 짧은 안내.
 * const [toast, showToast] = useToast(initial) → JSX 에 {toast} 배치, showToast('문구')
 */
export function useToast(initial?: string) {
  const [state, setState] = useState(() => ({ text: initial, id: 0 }))

  const show = useCallback((text: string) => {
    setState((s) => ({ text, id: s.id + 1 }))
  }, [])

  const node = state.text ? (
    // key 가 바뀌면 같은 문구여도 애니메이션이 다시 돈다
    <p key={state.id} className={shared.toast} role="status">
      {state.text}
    </p>
  ) : null

  return [node, show] as const
}
