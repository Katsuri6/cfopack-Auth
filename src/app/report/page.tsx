'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import KPICard from '@/components/ui/KPICard'
import InsightCard from '@/components/ui/InsightCard'
import { LineChart, BarChart, DonutChart } from '@/components/charts/SvgCharts'
import { fK, fP, fX, clrHex } from '@/lib/utils/format'
import type { FPAAnalysis, FPACommentary, FinAnalysis, FinCommentary } from '@/types'

const PAL = ['#00C8F0','#9B7FFF','#FFB020','#00DFA0','#FF4060','#FF6EB0']

function ReportContent() {
  const router = useRouter()
  const params = useSearchParams()
  const type = params.get('type') as 'fpa' | 'financial'

  const [fpaData, setFpaData] = useState<{ analysis: FPAAnalysis; commentary: FPACommentary } | null>(null)
  const [finData, setFinData] = useState<{ analysis: FinAnalysis; commentary: FinCommentary } | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    try {
      if (type === 'fpa') {
        const raw = sessionStorage.getItem('cfopack_fpa')
        if (raw) setFpaData(JSON.parse(raw))
        else router.push('/fpa')
      } else {
        const raw = sessionStorage.getItem('cfopack_fin')
        if (raw) setFinData(JSON.parse(raw))
        else router.push('/analysis')
      }
    } catch { router.push('/') }
  }, [type, router])

  if (type === 'fpa' && !fpaData) return <Loading color="#00C8F0" />
  if (type === 'financial' && !finData) return <Loading color="#9B7FFF" />

  if (type === 'fpa' && fpaData) return <FPAReport data={fpaData} activeTab={activeTab} setActiveTab={setActiveTab} router={router} />
  if (type === 'financial' && finData) return <FinReport data={finData} activeTab={activeTab} setActiveTab={setActiveTab} router={router} />
  return null
}

export default function ReportPage() {
  return <Suspense fallback={<Loading color="#00C8F0"/>}><ReportContent/></Suspense>
}

function Loading({ color }: { color: string }) {
  return (
    <div style={{ minHeight:'100vh', background:'#070D18', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:48, height:48, border:`2px solid #1C2E45`, borderTopColor:color, borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FP&A Report
// ═══════════════════════════════════════════════════════════════════════════════
function FPAReport({ data, activeTab, setActiveTab, router }: { data: { analysis: FPAAnalysis; commentary: FPACommentary }; activeTab: string; setActiveTab: (t:string) => void; router: ReturnType<typeof useRouter> }) {
  const { analysis: an, commentary: co } = data
  const k = an.kpis
  const ratingColor = co.overallRating === 'Favorable' ? '#00DFA0' : co.overallRating === 'Unfavorable' ? '#FF4060' : '#FFB020'

  const TABS = [['overview','Overview'],['drivers','Drivers & Costs'],['variance','Variance Table'],['recs','Recommendations']]

  return (
    <div style={{ minHeight:'100vh', background:'#070D18' }}>
      <Navbar showBack onBack={() => router.push('/fpa')} />
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'82px 22px 120px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:14, marginBottom:22 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
              <span style={{ padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700, background:`${ratingColor}1A`, color:ratingColor, border:`1px solid ${ratingColor}40`, textTransform:'uppercase', letterSpacing:'.06em' }}>{co.overallRating}</span>
              <span className="tag tag-acc">FP&amp;A Suite</span>
            </div>
            <h1 style={{ fontSize:'clamp(18px,3vw,30px)', fontWeight:700, lineHeight:1.15, marginBottom:6 }}>{co.headline}</h1>
            <p style={{ color:'#607898', fontSize:12 }}>{an.months.join(', ')} · {an.rows.length} records</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-ghost" style={{ padding:'8px 14px', borderRadius:8, fontSize:12 }} onClick={() => alert('PDF export — add jsPDF in production')}>⬇ PDF</button>
            <button className="btn-ghost" style={{ padding:'8px 14px', borderRadius:8, fontSize:12 }} onClick={() => alert('PPT export — add pptxgenjs in production')}>📊 PPT</button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
          <KPICard label="Total Revenue" value={fK(k.aRev)} sub={`Budget: ${fK(k.bRev)}`} />
          <KPICard label="Revenue Variance" value={fK(k.revVar)} sub={fP(k.revVarP)} valueColor={clrHex(k.revVar)} subColor={clrHex(k.revVar)} />
          <KPICard label="EBITDA" value={fK(k.aEB)} sub={`Budget: ${fK(k.bEB)}`} />
          <KPICard label="EBITDA Variance" value={fK(k.ebVar)} sub={fP(k.ebVarP)} valueColor={clrHex(k.ebVar)} subColor={clrHex(k.ebVar)} />
        </div>

        {/* Executive Summary */}
        <div style={{ background:'rgba(0,200,240,.04)', border:'1px solid rgba(0,200,240,.15)', borderLeft:'3px solid #00C8F0', borderRadius:12, padding:20, marginBottom:18 }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.09em', color:'#00C8F0', marginBottom:8 }}>📋 Executive Summary</p>
          <p style={{ lineHeight:1.75, fontSize:14 }}>{co.executiveSummary}</p>
        </div>

        {/* Charts */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:18 }}>
          <div className="card" style={{ padding:20 }}>
            <p className="section-label">Revenue — Budget vs Actual</p>
            <BarChart
              labels={an.monthly.map(m => m.Month)}
              datasets={[{ data:an.monthly.map(m=>m.bRev), color:'#2E4260', label:'Budget' },{ data:an.monthly.map(m=>m.aRev), color:'#00C8F0', label:'Actual' }]}
            />
          </div>
          <div className="card" style={{ padding:20 }}>
            <p className="section-label">EBITDA — Budget vs Actual</p>
            <BarChart
              labels={an.monthly.map(m=>m.Month)}
              datasets={[{ data:an.monthly.map(m=>m.bEB), color:'#2E4260', label:'Budget' },{ data:an.monthly.map(m=>m.aEB), color:'#9B7FFF', label:'Actual' }]}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {TABS.map(([k,l]) => (
            <button key={k} className={`tab-btn ${activeTab===k?'active-acc':''}`} onClick={() => setActiveTab(k)}>{l}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="card" style={{ padding:22 }}>
              <p className="section-label">Key Business Drivers</p>
              {co.keyDrivers.map((d,i) => (
                <div key={i} style={{ display:'flex', gap:8, marginBottom:10 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#00C8F0', flexShrink:0, marginTop:7 }}/>
                  <span style={{ fontSize:13, lineHeight:1.6 }}>{d}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding:22 }}>
              <p className="section-label">Cost Analysis</p>
              <p style={{ fontSize:13, lineHeight:1.65, marginBottom:14 }}>{co.costAnalysis}</p>
              <p className="section-label" style={{ marginTop:16 }}>Cash Flow</p>
              <p style={{ fontSize:13, lineHeight:1.65 }}>{co.cashFlowObservations}</p>
            </div>
            <div className="card" style={{ padding:22 }}>
              <p className="section-label" style={{ color:'#FF4060' }}>⚠ Risks</p>
              {co.risksAndOpportunities.risks.map((r,i) => (
                <div key={i} style={{ padding:'9px 12px', borderRadius:8, background:'rgba(255,64,96,.07)', borderLeft:'2px solid #FF4060', fontSize:13, marginBottom:8 }}>{r}</div>
              ))}
            </div>
            <div className="card" style={{ padding:22 }}>
              <p className="section-label" style={{ color:'#00DFA0' }}>◆ Opportunities</p>
              {co.risksAndOpportunities.opportunities.map((o,i) => (
                <div key={i} style={{ padding:'9px 12px', borderRadius:8, background:'rgba(0,223,160,.07)', borderLeft:'2px solid #00DFA0', fontSize:13, marginBottom:8 }}>{o}</div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="card" style={{ padding:22 }}>
            <p className="section-label">Expense Mix (Actual)</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'center' }}>
              <div style={{ display:'flex', justifyContent:'center' }}>
                <DonutChart data={Object.entries(an.expByDept).map(([name,value]) => ({ name, value: value as number }))} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {Object.entries(an.expByDept).map(([name, value], i) => (
                  <div key={name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'#0C1420', borderRadius:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:PAL[i%PAL.length] }}/>
                      <span style={{ fontSize:13 }}>{name}</span>
                    </div>
                    <span style={{ fontSize:13, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fK(value as number)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'variance' && (
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead><tr>
                  {['Dept','Account','Month','Budget','Actual','Variance','Var%','Status'].map(h => (
                    <th key={h} style={['Budget','Actual','Variance','Var%'].includes(h)?{textAlign:'right'}:{}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {an.rows.map((r,i) => (
                    <tr key={i}>
                      <td style={{ color:'#607898', fontSize:12 }}>{r.Department}</td>
                      <td style={{ fontWeight:500 }}>{r.Account}</td>
                      <td style={{ color:'#607898', fontSize:12 }}>{r.Month}</td>
                      <td style={{ textAlign:'right', fontVariantNumeric:'tabular-nums', color:'#607898' }}>{fK(r.Budget)}</td>
                      <td style={{ textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{fK(r.Actual)}</td>
                      <td style={{ textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:600, color:r.fav?'#00DFA0':'#FF4060' }}>{r.v>=0?'+':''}{fK(r.v)}</td>
                      <td style={{ textAlign:'right', color:r.fav?'#00DFA0':'#FF4060' }}>{fP(r.vp)}</td>
                      <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:r.fav?'rgba(0,223,160,.1)':'rgba(255,64,96,.1)', color:r.fav?'#00DFA0':'#FF4060', border:`1px solid ${r.fav?'rgba(0,223,160,.3)':'rgba(255,64,96,.3)'}` }}>{r.fav?'✓ Fav':'✗ Unfav'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'recs' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:12 }}>
            {co.recommendations.map((r,i) => (
              <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'14px 16px', background:'#101B2B', borderRadius:10, border:'1px solid #1C2E45' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(0,200,240,.1)', border:'1px solid rgba(0,200,240,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#00C8F0', flexShrink:0 }}>{i+1}</div>
                <span style={{ fontSize:13, lineHeight:1.6 }}>{r}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Financial Analysis Report
// ═══════════════════════════════════════════════════════════════════════════════
function FinReport({ data, activeTab, setActiveTab, router }: { data: { analysis: FinAnalysis; commentary: FinCommentary }; activeTab: string; setActiveTab: (t:string) => void; router: ReturnType<typeof useRouter> }) {
  const { analysis: fin, commentary: ins } = data
  const pd   = fin.periodData
  const last = pd[pd.length-1] || { revenue:0, grossMargin:0, opMargin:0, costs:0 }
  const prev = pd[pd.length-2] || null
  const displayRev = fin.totalRev || last.revenue
  const revGrowth = prev?.revenue ? ((last.revenue-prev.revenue)/Math.abs(prev.revenue))*100 : 0
  const gmDiff = prev ? last.grossMargin-prev.grossMargin : 0

  const TABS = [['trends','Trends'],['margins','Margin Analysis'],['costs','Cost Structure'],['anomalies','Anomalies'],['data','Data Table']]

  return (
    <div style={{ minHeight:'100vh', background:'#070D18' }}>
      <Navbar showBack onBack={() => router.push('/analysis')} />
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'82px 22px 120px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:14, marginBottom:22 }}>
          <div>
            <div style={{ marginBottom:10 }}><span className="tag tag-pur">Financial Analysis</span></div>
            <h1 style={{ fontSize:'clamp(18px,3vw,30px)', fontWeight:700, lineHeight:1.15, marginBottom:6 }}>{ins.headline || 'Financial Analysis Report'}</h1>
            <p style={{ color:'#607898', fontSize:12 }}>{fin.periods.join(' · ')} · {fin.records.length} records</p>
          </div>
          <button className="btn-ghost" style={{ padding:'8px 14px', borderRadius:8, fontSize:12 }} onClick={() => alert('PDF export — add jsPDF in production')}>⬇ PDF</button>
        </div>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
          <KPICard label="Total Revenue" value={fK(displayRev)} sub={`${fin.periods.length} period${fin.periods.length!==1?'s':''}`} valueColor="#00DFA0" subColor="#00DFA0" />
          <KPICard label="Gross Margin" value={fX(last.grossMargin)} sub={prev?`${fP(gmDiff)}pp vs prior`:'Latest period'} valueColor={gmDiff>=0?'#00DFA0':'#FF4060'} />
          <KPICard label="Operating Margin" value={fX(last.opMargin)} sub="Latest period" valueColor={last.opMargin>=15?'#00DFA0':last.opMargin>=5?'#FFB020':'#FF4060'} />
          <KPICard label="Total Costs" value={fK(last.costs)} sub={fX(last.revenue?last.costs/last.revenue*100:0)+' of revenue'} valueColor="#FFB020" />
        </div>

        {/* Diagnostic */}
        <div style={{ background:'rgba(155,127,255,.05)', border:'1px solid rgba(155,127,255,.2)', borderLeft:'3px solid #9B7FFF', borderRadius:12, padding:20, marginBottom:18 }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.09em', color:'#9B7FFF', marginBottom:8 }}>🔍 Financial Diagnostic</p>
          <p style={{ lineHeight:1.75, fontSize:14 }}>{ins.diagnostic}</p>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {TABS.map(([k,l]) => <button key={k} className={`tab-btn ${activeTab===k?'active-pur':''}`} onClick={() => setActiveTab(k)}>{l}</button>)}
        </div>

        {activeTab === 'trends' && pd.length > 1 && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div className="card" style={{ padding:20 }}>
                <p className="section-label">Revenue vs Costs</p>
                <LineChart labels={pd.map(p=>p.period)} datasets={[{data:pd.map(p=>p.revenue),color:'#9B7FFF'},{data:pd.map(p=>p.costs),color:'#FF4060',dashed:true}]} />
              </div>
              <div className="card" style={{ padding:20 }}>
                <p className="section-label">Profit Trend</p>
                <LineChart labels={pd.map(p=>p.period)} datasets={[{data:pd.map(p=>p.grossProfit),color:'#00DFA0'},{data:pd.map(p=>p.operatingProfit),color:'#00C8F0'}]} />
              </div>
            </div>
            <div className="card" style={{ overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid #1C2E45', fontWeight:600, fontSize:14 }}>Period Summary</div>
              <div style={{ overflowX:'auto' }}>
                <table className="data-table">
                  <thead><tr>
                    {['Period','Revenue','Gross Profit','Op Profit','GM%','OpM%'].map(h => <th key={h} style={h!=='Period'?{textAlign:'right'}:{}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {pd.map((p,i) => (
                      <tr key={i}>
                        <td style={{ fontWeight:500 }}>{p.period}</td>
                        <td style={{ textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{fK(p.revenue)}</td>
                        <td style={{ textAlign:'right', fontVariantNumeric:'tabular-nums', color:p.grossProfit>=0?'#00DFA0':'#FF4060' }}>{fK(p.grossProfit)}</td>
                        <td style={{ textAlign:'right', fontVariantNumeric:'tabular-nums', color:p.operatingProfit>=0?'#00DFA0':'#FF4060' }}>{fK(p.operatingProfit)}</td>
                        <td style={{ textAlign:'right', color:p.grossMargin>=30?'#00DFA0':'#607898' }}>{fX(p.grossMargin)}</td>
                        <td style={{ textAlign:'right', color:p.opMargin>=15?'#00DFA0':p.opMargin>=5?'#FFB020':'#FF4060' }}>{fX(p.opMargin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'margins' && (
          <div>
            <div className="card" style={{ padding:22, marginBottom:16 }}>
              <p className="section-label">🔍 What&apos;s Driving Your Margins</p>
              {ins.marginInsights.map((m,i) => <InsightCard key={i} insight={m}/>)}
            </div>
            <div className="card" style={{ padding:22 }}>
              <p className="section-label">Recommendations</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:10 }}>
                {ins.recommendations.map((r,i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 14px', background:'#0C1420', borderRadius:9, border:'1px solid #1C2E45' }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(155,127,255,.15)', border:'1px solid rgba(155,127,255,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#9B7FFF', flexShrink:0 }}>{i+1}</div>
                    <span style={{ fontSize:13, lineHeight:1.55 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'costs' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="card" style={{ padding:22 }}>
              <p className="section-label">Cost as % of Revenue</p>
              {fin.costAccounts.slice(0,8).map((c,i) => {
                const pct = fin.totalRev ? (c.total/fin.totalRev)*100 : 0
                return (
                  <div key={c.account} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:12, fontWeight:500 }}>{c.account}</span>
                      <span style={{ fontSize:12, fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{fX(pct)}</span>
                    </div>
                    <div style={{ height:4, borderRadius:2, background:'#1C2E45', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.min(pct/40*100,100)}%`, background:PAL[i%PAL.length], borderRadius:2 }}/>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="card" style={{ padding:20 }}>
              <p className="section-label">Cost Mix</p>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
                <DonutChart data={fin.costAccounts.slice(0,6).map(c => ({ name:c.account, value:c.total }))}/>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {fin.costAccounts.slice(0,6).map((c,i) => (
                  <div key={c.account} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#607898' }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:PAL[i%PAL.length] }}/> {c.account}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anomalies' && (
          <div>
            <div className="card" style={{ padding:22, marginBottom:16 }}>
              <p className="section-label">Anomaly Detection</p>
              {fin.anomalies.length === 0 ? (
                <div style={{ padding:'10px 14px', borderRadius:9, background:'rgba(0,223,160,.07)', borderLeft:'3px solid #00DFA0', fontSize:13 }}>✅ No significant anomalies detected. All line items within normal variance ranges.</div>
              ) : fin.anomalies.map((a,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, padding:'12px 14px', borderRadius:9, background:Math.abs(a.change)>40?'rgba(255,64,96,.07)':'rgba(255,176,32,.07)', border:`1px solid ${Math.abs(a.change)>40?'rgba(255,64,96,.25)':'rgba(255,176,32,.25)'}` }}>
                  <div><p style={{ fontWeight:600, fontSize:13 }}>{a.account}</p><p style={{ color:'#607898', fontSize:12 }}>{a.category}</p></div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontWeight:700, fontSize:15, color:a.change>0?'#FF4060':'#00DFA0' }}>{fP(a.change)}</p>
                    <p style={{ color:'#607898', fontSize:11 }}>{fK(a.latest)} vs {fK(a.prev)} prior</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #1C2E45', fontWeight:600, fontSize:14 }}>All Records ({fin.records.length})</div>
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead><tr>{['Account','Category','Amount','Period'].map(h=><th key={h} style={h==='Amount'?{textAlign:'right'}:{}}>{h}</th>)}</tr></thead>
                <tbody>
                  {fin.records.slice(0,30).map((r,i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:500, fontSize:12 }}>{r.account}</td>
                      <td><span className="tag tag-pur" style={{ fontSize:9 }}>{r.category}</span></td>
                      <td style={{ textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{fK(r.amount)}</td>
                      <td style={{ color:'#607898', fontSize:12 }}>{r.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {fin.records.length>30 && <div style={{ padding:'11px 16px', borderTop:'1px solid #1C2E45', textAlign:'center', color:'#607898', fontSize:12 }}>Showing 30 of {fin.records.length} records</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
