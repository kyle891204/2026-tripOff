import shared from './shared.module.css'

/** 시연 시각 기준 지금 진행 중인 일정 표시 */
export default function LiveBadge() {
  return (
    <em className={shared.live}>
      <span aria-hidden />
      진행 중
    </em>
  )
}
