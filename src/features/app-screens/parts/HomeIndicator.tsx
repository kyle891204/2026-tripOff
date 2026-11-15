/** iOS 홈 인디케이터 (133×5, y838) */
export default function HomeIndicator({ light }: { light?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: 130,
        bottom: 9,
        width: 133,
        height: 5,
        borderRadius: 999,
        background: light ? '#fff' : 'var(--ink)',
        zIndex: 5,
      }}
    />
  )
}
