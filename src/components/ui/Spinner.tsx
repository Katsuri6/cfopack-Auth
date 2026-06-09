interface SpinnerProps {
  size?: number
  color?: 'acc' | 'pur'
  label?: string
  sublabel?: string
}

export default function Spinner({ size = 56, color = 'acc', label, sublabel }: SpinnerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div
        className={`spinner ${color === 'pur' ? 'spinner-purple' : ''}`}
        style={{ width: size, height: size }}
      />
      {label && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#E6EDF6' }}>{label}</p>
          {sublabel && <p style={{ color: '#607898', fontSize: 13 }}>{sublabel}</p>}
        </div>
      )}
    </div>
  )
}
