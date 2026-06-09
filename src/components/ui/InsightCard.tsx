import type { MarginInsight } from '@/types'

interface InsightCardProps {
  insight: MarginInsight
}

const STYLES = {
  red: { bg: 'rgba(255,64,96,.07)',   border: '#FF4060', label: '#FF4060' },
  amb: { bg: 'rgba(255,176,32,.07)',  border: '#FFB020', label: '#FFB020' },
  grn: { bg: 'rgba(0,223,160,.07)',   border: '#00DFA0', label: '#00DFA0' },
}

export default function InsightCard({ insight }: InsightCardProps) {
  const s = STYLES[insight.type] || STYLES.amb
  return (
    <div style={{
      padding: '11px 14px', borderRadius: 9, marginBottom: 10,
      background: s.bg, borderLeft: `3px solid ${s.border}`,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: s.label, marginBottom: 5 }}>
        {insight.severity}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: '#E6EDF6' }}>{insight.text}</p>
    </div>
  )
}
