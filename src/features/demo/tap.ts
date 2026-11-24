import s from './tap.module.css'

/** 누른 뒤 동작을 실행하기까지 */
const PRESS_MS = 220
/** 스크롤해서 버튼을 보여 준 뒤, 눈으로 따라올 시간 */
const SETTLE_MS = 280

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
 * 스크롤이 필요하면 멈출 때까지 기다렸다가 조금 쉬고 누른다.
 * 대상이 없거나 움직임 줄이기 설정이면 바로 실행한다.
 */
export function tapThen(selector: string | undefined, run: () => void) {
  const el = selector ? findTarget(selector) : undefined
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    run()
    return
  }
  el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  waitForStill(el, moved => window.setTimeout(() => press(el, run), moved ? SETTLE_MS : 0))
}

/** 요소 위치가 몇 프레임 연속 그대로면 스크롤이 멈춘 것으로 본다 (최대 1.2초) */
function waitForStill(el: HTMLElement, done: (moved: boolean) => void) {
  const start = performance.now()
  const first = el.getBoundingClientRect()
  let last = first
  let still = 0
  const check = () => {
    const now = el.getBoundingClientRect()
    still = now.top === last.top && now.left === last.left ? still + 1 : 0
    last = now
    if (still >= 4 || performance.now() - start > 1200) done(now.top !== first.top || now.left !== first.left)
    else requestAnimationFrame(check)
  }
  requestAnimationFrame(check)
}

function press(el: HTMLElement, run: () => void) {
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
}

/** data-tap 표시를 찾는 선택자 */
export const tapKey = (key: string) => `[data-tap="${key}"]`
