import s from './tap.module.css'

const PRESS_MS = 220

/** 마우스 화살표 (끝이 왼쪽 위 0,0) */
const CURSOR_SVG = '<svg width="22" height="26" viewBox="0 0 22 26"><path d="M1 1v20.5l5.6-5.2 3.6 8.2 3.6-1.6-3.6-8h7.6z" fill="#16181d" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'

/** 화면에 실제로 보이는 마지막 요소 (같은 표시가 여러 개면 위에 덮인 쪽) */
function findTarget(selector: string): HTMLElement | undefined {
  const all = [...document.querySelectorAll<HTMLElement>(selector)]
  return all.reverse().find(el => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && !(el as HTMLButtonElement).disabled
  })
}

/**
 * 시연용 누르기 모션: 대상 버튼을 화면에 보이게 스크롤하고, 누르는 모습을 보여 준 뒤 동작을 실행한다.
 * - 폰 화면 안(data-phone): 손가락 터치 (짧게 눌렸다 사라지는 점)
 * - 그 밖(파트너센터 같은 PC 화면): 마우스 커서가 다가와 클릭
 * 대상이 없거나 움직임 줄이기 설정이면 바로 실행한다.
 */
export function tapThen(selector: string | undefined, run: () => void) {
  const el = selector ? findTarget(selector) : undefined
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    run()
    return
  }
  const before = el.getBoundingClientRect()
  el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  // 스크롤이 필요했으면 조금 기다렸다가 누른다
  const offscreen = before.top < 0 || before.bottom > window.innerHeight
  window.setTimeout(() => {
    const r = el.getBoundingClientRect()
    const touch = !!el.closest('[data-phone]')
    const mark = document.createElement('span')
    mark.className = touch ? s.tap : s.cursor
    mark.style.left = `${r.left + r.width / 2}px`
    mark.style.top = `${r.top + r.height / 2}px`
    mark.setAttribute('aria-hidden', 'true')
    if (!touch) mark.innerHTML = CURSOR_SVG
    document.body.appendChild(mark)
    // 커서는 다가오는 시간만큼 늦게 눌린다
    const pressAt = touch ? 0 : 160
    window.setTimeout(() => el.classList.add(s.pressed), pressAt)
    window.setTimeout(() => {
      el.classList.remove(s.pressed)
      run()
    }, PRESS_MS + pressAt)
    window.setTimeout(() => mark.remove(), touch ? 450 : 650)
  }, offscreen ? 260 : 0)
}

/** data-tap 표시를 찾는 선택자 */
export const tapKey = (key: string) => `[data-tap="${key}"]`
