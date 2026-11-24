import { useEffect, useRef, useSyncExternalStore } from 'react'

/**
 * 화면이 시연 컨트롤러의 「다음」 버튼을 잠시 빌려 쓰는 통로.
 * 예: 상품 등록 화면은 「기본 정보 채우기 → … → 등록하기」, 결제 화면은 「시연 결제」를 다음 버튼에 맡긴다.
 * 컨트롤러는 지금 단계에서 허용한 scope 의 동작만 쓰고(demoFlow 의 act), 없으면 다음 단계로 넘어간다.
 */
export interface StepActionValue {
  /** 어느 화면의 동작인지 (앱 화면 id 또는 'product-new' 같은 파트너센터 화면 이름) */
  scope: string
  /** 다음 버튼 글자 */
  label: string
  /** 진행 표시 (예: 예시 데이터 2/5) */
  hint?: string
  /** 다음을 누르면 먼저 「터치」 모션을 보여 줄 화면 속 요소 (CSS 선택자, 보통 tapKey('...')) */
  tap?: string
  run: () => void
}

let actions: StepActionValue[] = []
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(listener => listener())

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/** 허용한 scope 중 가장 나중에 등록된 동작 */
export function useStepAction(allowed: readonly string[] | undefined) {
  const list = useSyncExternalStore(subscribe, () => actions)
  if (!allowed?.length) return null
  return [...list].reverse().find(action => allowed.includes(action.scope)) ?? null
}

type ProvideOptions = Omit<StepActionValue, 'run'> & { run: () => void; enabled?: boolean }

/** 화면에 떠 있는 동안 다음 버튼을 이 동작으로 바꾼다. run 은 항상 최신 함수를 부른다. */
export function useProvideStepAction({ scope, label, hint, tap, run, enabled = true }: ProvideOptions) {
  const runRef = useRef(run)
  useEffect(() => { runRef.current = run })
  useEffect(() => {
    if (!enabled) return
    const action: StepActionValue = { scope, label, hint, tap, run: () => runRef.current() }
    actions = [...actions, action]
    emit()
    return () => {
      actions = actions.filter(a => a !== action)
      emit()
    }
  }, [scope, label, hint, tap, enabled])
}

/** JSX 어디서나 쓸 수 있는 형태 (조건부 렌더링 뒤에서도 훅 순서를 신경 쓰지 않게) */
export function StepAction(props: ProvideOptions) {
  useProvideStepAction(props)
  return null
}
