interface KPICardProps {
  label: string
  value: string
  sub: string
  valueColor?: string
  subColor?: string
}

export default function KPICard({ label, value, sub, valueColor = '#E6EDF6', subColor = '#607898' }: KPICardProps) {
  return (
    <div className="card" style={{ padding: '19px 17px' }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color: valueColor }}>{value}</div>
      <div className="kpi-sub" style={{ color: subColor }}>{sub}</div>
    </div>
  )
}
