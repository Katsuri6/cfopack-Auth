'use client'
import { fK, fX } from '@/lib/utils/format'

const PAL = ['#00C8F0','#9B7FFF','#FFB020','#00DFA0','#FF4060','#FF6EB0','#60D0FF','#C0A0FF']

// ─── Shared helpers ────────────────────────────────────────────────────────────
function GridLines({ W, H, pad, min, max }: { W:number; H:number; pad:number; min:number; max:number }) {
  return <>
    {[0,1,2,3].map(i => {
      const y = 8 + (i/3)*(H*0.85)
      const val = max - (max-min)*(i/3)
      return <g key={i}>
        <line x1={pad} y1={y} x2={W} y2={y} stroke="#1C2E45" strokeWidth="1"/>
        <text x={pad-4} y={y+3} textAnchor="end" fontSize="9" fill="#607898">{fK(val)}</text>
      </g>
    })}
  </>
}

// ─── Line Chart ────────────────────────────────────────────────────────────────
interface LineDataset { data: number[]; color: string; dashed?: boolean }
interface LineChartProps { labels: string[]; datasets: LineDataset[]; height?: number }

export function LineChart({ labels, datasets, height = 200 }: LineChartProps) {
  if (!labels.length) return <p style={{ textAlign:'center', color:'#607898', fontSize:13, padding:40 }}>Need 2+ periods for chart</p>
  const all = datasets.flatMap(d => d.data).filter(Number.isFinite)
  if (!all.length) return null
  const mn = Math.min(...all) * 0.93, mx = Math.max(...all) * 1.07, range = mx - mn || 1
  const W = 400, H = height - 26, pad = 52
  const xs = (i: number) => pad + (i / Math.max(labels.length-1,1)) * (W - pad)
  const ys = (v: number) => H - ((v - mn) / range) * H * 0.85 - 8

  return (
    <svg viewBox={`0 0 ${W} ${height}`} style={{ width:'100%', height }} preserveAspectRatio="xMidYMid meet">
      <GridLines W={W} H={H} pad={pad} min={mn} max={mx}/>
      {labels.map((l, i) => (
        <text key={i} x={xs(i)} y={height-5} textAnchor="middle" fontSize="9" fill="#607898">{l}</text>
      ))}
      {datasets.map((ds, di) => {
        const pts = ds.data.map((v, i) => `${xs(i)},${ys(v)}`).join(' ')
        return <g key={di}>
          {di===0 && !ds.dashed && (
            <polygon
              points={`${xs(0)},${H} ${pts} ${xs(ds.data.length-1)},${H}`}
              fill={ds.color} opacity="0.1"
            />
          )}
          <polyline points={pts} fill="none" stroke={ds.color} strokeWidth="2" strokeLinejoin="round"
            strokeDasharray={ds.dashed ? '5 4' : undefined}/>
          {ds.data.map((v, i) => <circle key={i} cx={xs(i)} cy={ys(v)} r="3.5" fill={ds.color}/>)}
        </g>
      })}
    </svg>
  )
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
interface BarDataset { data: number[]; color: string; label?: string }
interface BarChartProps { labels: string[]; datasets: BarDataset[]; height?: number }

export function BarChart({ labels, datasets, height = 200 }: BarChartProps) {
  if (!labels.length) return null
  const all = datasets.flatMap(d => d.data).filter(Number.isFinite)
  if (!all.length) return null
  const mn = Math.min(0, ...all), mx = Math.max(...all) * 1.1, range = mx - mn || 1
  const W = 400, H = height - 26, pad = 52
  const gw = (W - pad) / labels.length
  const bw = Math.min(28, gw * 0.36)
  const ys = (v: number) => H - ((v - mn) / range) * H * 0.85 - 8
  const bh = (v: number) => Math.abs(((v - mn) / range) * H * 0.85)

  return (
    <svg viewBox={`0 0 ${W} ${height}`} style={{ width:'100%', height }} preserveAspectRatio="xMidYMid meet">
      <GridLines W={W} H={H} pad={pad} min={mn} max={mx}/>
      {labels.map((l, i) => (
        <text key={i} x={pad + (i + 0.5) * gw} y={height-5} textAnchor="middle" fontSize="9" fill="#607898">{l}</text>
      ))}
      {datasets.map((ds, di) => ds.data.map((v, i) => {
        const x = pad + i * gw + (di === 0 ? gw * 0.04 : bw + gw * 0.10)
        return <rect key={`${di}-${i}`} x={x} y={ys(v)} width={bw} height={Math.max(bh(v),1)} fill={ds.color} rx="2"/>
      }))}
    </svg>
  )
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
interface DonutSlice { name: string; value: number }
interface DonutChartProps { data: DonutSlice[]; size?: number }

export function DonutChart({ data, size = 140 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + Math.abs(d.value), 0)
  if (!total) return null
  const cx = size/2, cy = size/2, r = size*0.38, ir = size*0.22
  let ang = -Math.PI/2
  const paths = data.map((d, i) => {
    const sl = (Math.abs(d.value)/total) * Math.PI * 2
    const x1 = cx+r*Math.cos(ang), y1 = cy+r*Math.sin(ang)
    const x2 = cx+r*Math.cos(ang+sl), y2 = cy+r*Math.sin(ang+sl)
    const ix1 = cx+ir*Math.cos(ang), iy1 = cy+ir*Math.sin(ang)
    const ix2 = cx+ir*Math.cos(ang+sl), iy2 = cy+ir*Math.sin(ang+sl)
    const lg = sl > Math.PI ? 1 : 0
    const path = `M${ix1},${iy1} L${x1},${y1} A${r},${r} 0 ${lg} 1 ${x2},${y2} L${ix2},${iy2} A${ir},${ir} 0 ${lg} 0 ${ix1},${iy1}`
    ang += sl
    return <path key={i} d={path} fill={PAL[i%PAL.length]} stroke="#101B2B" strokeWidth="2"/>
  })
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      {paths}
    </svg>
  )
}
