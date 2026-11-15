import { useMemo } from 'react'
import QRCode from 'qrcode'

interface Props {
  value: string
  /** 한 변 픽셀 크기 */
  size: number
  color?: string
}

/**
 * Figma 스타일 QR: 모서리가 둥근 파인더 패턴(7·5·3 모듈, 반경 ≈ 크기의 22.8%)
 * + 사각 모듈. 실제로 스캔되는 QR 을 그린다.
 */
export default function QrCode({ value, size, color = 'var(--ink)' }: Props) {
  const { count, cells } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'M', version: 2 })
    const n = qr.modules.size
    const out: Array<[number, number]> = []
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!qr.modules.get(r, c)) continue
        if (isFinder(r, c, n)) continue
        out.push([c, r])
      }
    }
    return { count: n, cells: out }
  }, [value])

  const finders: Array<[number, number]> = [
    [0, 0],
    [count - 7, 0],
    [0, count - 7],
  ]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${count} ${count}`} role="img" aria-label="QR 코드">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={color} />
      ))}
      {finders.map(([x, y]) => (
        <g key={`f-${x}-${y}`}>
          <rect x={x} y={y} width={7} height={7} rx={1.6} fill={color} />
          <rect x={x + 1} y={y + 1} width={5} height={5} rx={1.1} fill="#fff" />
          <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.8} fill={color} />
        </g>
      ))}
    </svg>
  )
}

function isFinder(r: number, c: number, n: number) {
  const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7
  return inBox(0, 0) || inBox(0, n - 7) || inBox(n - 7, 0)
}
