import type { CSSProperties } from 'react'

export type AvatarTone = 'coral' | 'teal' | 'sand' | 'off'

const BG: Record<AvatarTone, string> = {
  coral: 'var(--coral)',
  teal: 'var(--teal-mid)',
  sand: 'var(--sand)',
  off: 'var(--avatar-off)',
}

interface Props {
  /** 원 안에 표시할 한 글자 */
  label: string
  /** 스크린리더용 전체 이름 */
  name: string
  tone: AvatarTone
  /** 원 지름 (링 제외) */
  size: number
  /** 바깥 링 두께와 색 (카드 위 겹침 표현) */
  ring?: { width: number; color: string }
  fontSize: number
  style?: CSSProperties
}

/** 이름 한 글자 아바타 */
export default function Avatar({ label, name, tone, size, ring, fontSize, style }: Props) {
  return (
    <span
      role="img"
      aria-label={name}
      style={{
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: BG[tone],
        color: '#fff',
        fontWeight: 700,
        fontSize,
        lineHeight: 1,
        boxShadow: ring ? `0 0 0 ${ring.width}px ${ring.color}` : undefined,
        flex: 'none',
        ...style,
      }}
    >
      {label}
    </span>
  )
}
