/**
 * AlertBox — shows success or error messages on auth forms.
 */
interface AlertBoxProps {
  type: 'error' | 'success' | 'info'
  message: string
}

const STYLES = {
  error:   { bg: 'rgba(255,64,96,.1)',  border: 'rgba(255,64,96,.3)',  color: '#FF4060', icon: '⚠' },
  success: { bg: 'rgba(0,223,160,.1)',  border: 'rgba(0,223,160,.3)',  color: '#00DFA0', icon: '✓' },
  info:    { bg: 'rgba(0,200,240,.1)',  border: 'rgba(0,200,240,.3)',  color: '#00C8F0', icon: 'ℹ' },
}

export default function AlertBox({ type, message }: AlertBoxProps) {
  const s = STYLES[type]
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 9, padding: '11px 14px', marginBottom: 20,
      display: 'flex', gap: 9, alignItems: 'flex-start',
    }}>
      <span style={{ color: s.color, fontWeight: 700, flexShrink: 0 }}>{s.icon}</span>
      <p style={{ fontSize: 13, color: s.color, lineHeight: 1.5 }}>{message}</p>
    </div>
  )
}
