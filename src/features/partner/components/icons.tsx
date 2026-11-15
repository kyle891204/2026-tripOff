/*
 * Icons drawn to match the Figma vectors (icon/close 16, icon/calendar 16, radio 18, QR placeholder 148).
 * The Figma asset URLs could not be downloaded from this environment, so these are
 * hand-made equivalents. Swap them for exported SVGs from Figma if exact paths matter.
 */

export function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="#5b616e" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="#1d43a6" strokeWidth="1.4" />
      <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="#1d43a6" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function RadioMark({ checked }: { checked: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="8" fill="#fff" stroke={checked ? '#2453c9' : '#aeb5c0'} strokeWidth="1.5" />
      {checked && <circle cx="9" cy="9" r="4.5" fill="#2453c9" />}
    </svg>
  )
}

export function HistoryDot({ done }: { done: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <circle cx="5" cy="5" r={done ? 5 : 4} fill={done ? '#2453c9' : '#fff'} stroke={done ? 'none' : '#aeb5c0'} strokeWidth="1.5" />
    </svg>
  )
}

/** Placeholder QR shown in the voucher preview. The real code is issued per booking. */
export function QrPlaceholder({ kind }: { kind: 'qr' | 'barcode' | 'number' }) {
  if (kind === 'barcode') {
    const bars = [3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 1, 3, 1, 2]
    let x = 4
    return (
      <svg width="200" height="80" viewBox="0 0 200 80" aria-label="바코드 자리">
        {bars.map((w, i) => {
          const rect = i % 2 === 0 ? <rect key={i} x={x} y="6" width={w * 2.2} height="68" fill="#16181d" /> : null
          x += w * 2.2 + 1.6
          return rect
        })}
      </svg>
    )
  }
  if (kind === 'number') {
    return (
      <div
        aria-label="확정번호만 표시"
        style={{ width: 148, height: 148, border: '1.5px dashed #aeb5c0', borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 13, color: '#5b616e' }}
      >
        명단 대조용
      </div>
    )
  }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="42" height="42" rx="6" fill="#16181d" />
      <rect x={x + 7} y={y + 7} width="28" height="28" rx="3" fill="#fff" />
      <rect x={x + 13} y={y + 13} width="16" height="16" rx="2" fill="#16181d" />
    </g>
  )
  const cells: Array<[number, number]> = [
    [58, 8], [70, 8], [82, 20], [58, 32], [94, 32], [70, 44], [8, 58], [32, 58], [58, 58], [82, 58], [106, 58],
    [128, 58], [20, 70], [70, 70], [118, 70], [58, 82], [94, 82], [128, 82], [58, 106], [82, 94], [106, 106],
    [70, 118], [94, 128], [128, 118], [118, 128],
  ]
  return (
    <svg width="148" height="148" viewBox="0 0 148 148" aria-label="QR 코드 자리">
      {finder(8, 8)}
      {finder(98, 8)}
      {finder(8, 98)}
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="12" height="12" rx="2" fill="#16181d" />
      ))}
    </svg>
  )
}
