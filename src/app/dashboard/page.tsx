'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ReportRow {
  id: string
  title: string
  report_type: 'fpa' | 'financial'
  snapshot: Record<string, unknown>
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [reports, setReports] = useState<ReportRow[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportError, setReportError] = useState('')

  useEffect(() => {
    const sb = createClient()

    // Load reports immediately — no auth check needed, RLS handles it
    // Read token directly from localStorage
const tokenKey = 'sb-xgfhumfwinvsvqqhzhoa-auth-token'
const raw = localStorage.getItem(tokenKey)
const token = raw ? JSON.parse(raw).access_token : null

if (token) {
  fetch('https://xgfhumfwinvsvqqhzhoa.supabase.co/rest/v1/reports?select=id,title,report_type,snapshot,created_at&order=created_at.desc&limit=20', {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZmh1bWZ3aW52c3ZxcWh6aG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDIwMzYsImV4cCI6MjA5NTQxODAzNn0.iPms8GJXP7SYA_jad6f3OEFgSdLQ73gELUSUeMucioY',
      'Authorization': 'Bearer ' + token,
    }
  })
  .then(r => r.json())
  .then(data => {
    console.log('Reports loaded:', data.length)
    setReports(Array.isArray(data) ? data : [])
  })
  .catch(e => console.error('Reports error:', e))
} else {
  console.log('No token found in localStorage')
}

    // Load email in background
    sb.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email || '')
    }).catch(() => {})

  }, [])

  async function signOut() {
    await createClient().auth.signOut()
    document.location.href = '/auth/login'
  }

  async function deleteReport(id: string) {
    await createClient().from('reports').delete().eq('id', id)
    setReports(prev => prev.filter(r => r.id !== id))
  }

  const name = email ? email.split('@')[0] : '...'

  return (
    <div style={{ minHeight:'100vh', background:'#070D18' }}>
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:300, height:62, background:'rgba(7,13,24,.96)', backdropFilter:'blur(20px)', borderBottom:'1px solid #1C2E45' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 22px', height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={()=>router.push('/')} style={{ display:'flex', alignItems:'center', gap:9, background:'none', border:'none', cursor:'pointer' }}>
            <div style={{ width:28, height:28, background:'#00C8F0', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 12L5.5 6L9 10L11.5 7" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11.5" cy="7" r="1.2" fill="#000"/></svg>
            </div>
            <span style={{ fontWeight:700, fontSize:15, color:'#E6EDF6' }}>CFO<span style={{ color:'#00C8F0' }}>Pack</span></span>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={()=>router.push('/fpa')} style={{ padding:'7px 15px', borderRadius:8, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#00C8F0,#0088aa)', color:'#000' }}>+ FP&amp;A</button>
            <button onClick={()=>router.push('/analysis')} style={{ padding:'7px 15px', borderRadius:8, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#9B7FFF,#6040CC)', color:'#fff' }}>+ Analysis</button>
            <div style={{ position:'relative' }}>
              <button onClick={()=>setMenuOpen(!menuOpen)} style={{ width:34, height:34, borderRadius:'50%', background:'#1C2E45', border:'1px solid #2E4260', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:'#00C8F0' }}>
                {email[0]?.toUpperCase()||'U'}
              </button>
              {menuOpen && (
                <>
                  <div onClick={()=>setMenuOpen(false)} style={{ position:'fixed', inset:0, zIndex:10 }}/>
                  <div style={{ position:'absolute', right:0, top:42, width:200, background:'#101B2B', border:'1px solid #1C2E45', borderRadius:12, boxShadow:'0 16px 40px rgba(0,0,0,.5)', zIndex:20, overflow:'hidden' }}>
                    <div style={{ padding:'12px 16px', borderBottom:'1px solid #1C2E45' }}>
                      <p style={{ fontSize:12, color:'#607898' }}>{email}</p>
                    </div>
                    <button onClick={signOut} style={{ width:'100%', padding:'12px 16px', textAlign:'left', background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#FF4060', fontFamily:'inherit' }}>Sign out</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'82px 22px 60px' }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:28, fontWeight:700, marginBottom:6 }}>Welcome back, {name} 👋</h1>
          <p style={{ color:'#607898', fontSize:14 }}>Your financial intelligence hub</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16, marginBottom:32 }}>
          {[
            { color:'#00C8F0', title:'FP&A Suite', desc:'Budget vs Actuals, variance analysis, board pack.', href:'/fpa' },
            { color:'#9B7FFF', title:'Financial Analysis', desc:'Trends, margin diagnostics, anomaly detection.', href:'/analysis' },
          ].map(c => (
            <div key={c.title} onClick={()=>router.push(c.href)}
              style={{ background:'#101B2B', border:'1px solid #1C2E45', borderRadius:14, padding:24, cursor:'pointer' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=c.color}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#1C2E45'}}>
              <p style={{ fontWeight:700, fontSize:15, marginBottom:8, color:c.color }}>{c.title}</p>
              <p style={{ color:'#607898', fontSize:13, lineHeight:1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Recent Reports</h2>

        {reportError && (
          <div style={{ background:'rgba(255,64,96,.1)', border:'1px solid rgba(255,64,96,.3)', borderRadius:8, padding:'10px 14px', color:'#FF4060', fontSize:13, marginBottom:16 }}>
            Error loading reports: {reportError}
          </div>
        )}

        <div style={{ background:'#101B2B', border:'1px solid #1C2E45', borderRadius:12, overflow:'hidden' }}>
          {reports.length === 0 ? (
            <div style={{ padding:'50px 20px', textAlign:'center' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📊</div>
              <p style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>No reports yet</p>
              <p style={{ color:'#607898', fontSize:13 }}>Run your first analysis to see it here</p>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>{['Title','Type','Revenue','Margin','Date',''].map(h=>(
                    <th key={h} style={{ color:'#607898', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', padding:'10px 16px', textAlign:'left', borderBottom:'1px solid #1C2E45' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {reports.map(r => {
                    const s = r.snapshot as Record<string,unknown>
                    const rev = s.totalRevenue as number|null
                    const gm = s.grossMargin as number|null
                    return (
                      <tr key={r.id}>
                        <td style={{ padding:'12px 16px', fontSize:13, fontWeight:500 }}>{r.title}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:700, background:r.report_type==='fpa'?'rgba(0,200,240,.1)':'rgba(155,127,255,.1)', color:r.report_type==='fpa'?'#00C8F0':'#9B7FFF', border:`1px solid ${r.report_type==='fpa'?'rgba(0,200,240,.2)':'rgba(155,127,255,.2)'}` }}>
                            {r.report_type==='fpa'?'FP&A':'Analysis'}
                          </span>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:13 }}>{rev?`$${rev>=1e6?(rev/1e6).toFixed(1)+'M':rev>=1e3?Math.round(rev/1e3)+'K':Math.round(rev)}`:'—'}</td>
                        <td style={{ padding:'12px 16px', fontSize:13, color:gm?(gm>30?'#00DFA0':'#FFB020'):'#607898' }}>{gm?`${gm.toFixed(1)}%`:'—'}</td>
                        <td style={{ padding:'12px 16px', fontSize:12, color:'#607898' }}>{new Date(r.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <button onClick={()=>deleteReport(r.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#607898', fontSize:18 }}>×</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}