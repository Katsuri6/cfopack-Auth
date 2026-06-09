'use client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

const FEATURES = [
  { emoji: '📊', title: 'Variance Analysis', desc: 'Budget vs Actuals with absolute & % variances, favorable/unfavorable flags and period summaries.' },
  { emoji: '📈', title: 'Trend Analysis', desc: 'Multi-period revenue, cost and profit trends with period-over-period growth rate calculations.' },
  { emoji: '🔍', title: 'Margin Diagnostics', desc: "Identifies exactly what's compressing your gross, operating and net margins with specific numbers." },
  { emoji: '💸', title: 'Cost Structure', desc: 'See exactly what percentage of revenue each cost line is consuming, ranked by impact.' },
  { emoji: '⚡', title: 'Anomaly Detection', desc: 'Automatically flags unusual spikes, drops and outliers across all line items and periods.' },
  { emoji: '💬', title: 'Smart Analyst Chat', desc: 'Ask plain-language questions about your data and get CFO-quality answers instantly.' },
]

export default function HomePage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#070D18' }}>
      <Navbar />

      {/* Hero */}
      <div
        className="grid-bg"
        style={{
          position: 'relative', minHeight: '86vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', overflow: 'hidden', paddingTop: 62,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(0,200,240,.08), transparent 70%)' }}/>
        <div className="animate-fade-up" style={{ position: 'relative', maxWidth: 780, padding: '0 22px' }}>
          <span className="tag tag-acc" style={{ display: 'inline-flex', marginBottom: 24 }}>
            ✦ Finance Intelligence Platform
          </span>
          <h1 style={{ fontSize: 'clamp(34px,6.5vw,72px)', lineHeight: 1.06, letterSpacing: '-.03em', marginBottom: 18, fontWeight: 700 }}>
            Your Complete<br/>
            <span style={{ color: '#00C8F0' }}>Finance Intelligence</span><br/>
            Platform
          </h1>
          <p style={{ fontSize: 'clamp(14px,2vw,18px)', color: '#607898', lineHeight: 1.65, maxWidth: 540, margin: '0 auto 36px' }}>
            Two powerful modules. Upload your data and get boardroom-ready insights, smart commentary, charts and actionable recommendations — in minutes.
          </p>

          {/* Module Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, maxWidth: 660, margin: '0 auto 32px', textAlign: 'left' }}>
            <ModuleCard
              color="#00C8F0"
              accentBg="rgba(0,200,240,.09)"
              accentBdr="rgba(0,200,240,.2)"
              iconSvg={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00C8F0" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
              title="FP&A Suite"
              desc="Budget vs Actuals analysis, variance engine, CFO commentary, board packs."
              tags={[{ label:'Variance', variant:'acc' }, { label:'Commentary', variant:'acc' }, { label:'Board Pack', variant:'acc' }]}
              onClick={() => router.push('/fpa')}
            />
            <ModuleCard
              color="#9B7FFF"
              accentBg="rgba(155,127,255,.1)"
              accentBdr="rgba(155,127,255,.2)"
              iconSvg={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9B7FFF" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
              title="Financial Analysis"
              desc="Trend analysis, margin diagnostics, cost structure, anomaly detection — no budget needed."
              tags={[{ label:'Trends', variant:'pur' }, { label:'Margins', variant:'pur' }, { label:'Anomalies', variant:'pur' }]}
              onClick={() => router.push('/analysis')}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '13px 28px', borderRadius: 10, fontSize: 15 }} onClick={() => router.push('/fpa')}>
              Try FP&amp;A Demo
            </button>
            <button className="btn-purple" style={{ padding: '13px 28px', borderRadius: 10, fontSize: 15 }} onClick={() => router.push('/analysis')}>
              Try Analysis Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 22px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 700, marginBottom: 12 }}>Two modules, one platform</h2>
          <p style={{ color: '#607898', fontSize: 14 }}>Whether you have a budget or just actuals — we have you covered.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`card animate-fade-up-${i % 3}`} style={{ padding: 22, transition: 'all .3s' }}>
              <div style={{ fontSize: 22, marginBottom: 12 }}>{f.emoji}</div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{f.title}</div>
              <p style={{ color: '#607898', fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Module Card ───────────────────────────────────────────────────────────────
interface ModuleCardProps {
  color: string; accentBg: string; accentBdr: string
  iconSvg: React.ReactNode; title: string; desc: string
  tags: { label: string; variant: string }[]
  onClick: () => void
}

function ModuleCard({ color, accentBg, accentBdr, iconSvg, title, desc, tags, onClick }: ModuleCardProps) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{ padding: 24, cursor: 'pointer', transition: 'all .3s' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = color; el.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = '#1C2E45'; el.style.transform = ''
      }}
    >
      <div style={{ width:44, height:44, borderRadius:11, background:accentBg, border:`1px solid ${accentBdr}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
        {iconSvg}
      </div>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:8 }}>{title}</div>
      <p style={{ color:'#607898', fontSize:13, lineHeight:1.65, marginBottom:12 }}>{desc}</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {tags.map(t => (
          <span key={t.label} className={`tag tag-${t.variant}`} style={{ fontSize:9 }}>{t.label}</span>
        ))}
      </div>
    </div>
  )
}
