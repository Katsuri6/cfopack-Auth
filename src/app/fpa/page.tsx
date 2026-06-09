'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FPA_DEMO } from '@/lib/data/demo'
import { calcFPA, buildFPACommentary } from '@/lib/engines/fpa'
import { saveFPAReport } from '@/lib/utils/saveReport'

const STEPS = ['Uploading files…','Parsing data…','Calculating variances…','Building commentary…','Done!']

function parseCSV(text: string): Record<string, unknown>[] {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(/[,\t]/).map(h => h.trim().replace(/^"|"$/g, '').replace(/\r/, ''))
  return lines.slice(1).map(line => {
    const vals = line.split(/[,\t]/).map(v => v.trim().replace(/^"|"$/g, '').replace(/\r/, '').replace(/[$,]/g, ''))
    const obj: Record<string, unknown> = {}
    headers.forEach((h, i) => {
      const v = vals[i] || ''
      obj[h] = v === '' ? null : isNaN(Number(v)) ? v : Number(v)
    })
    return obj
  }).filter(r => Object.values(r).some(v => v !== null && v !== ''))
}

export default function FPAPage() {
  const router = useRouter()
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [useDemo, setUseDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [error, setError] = useState('')

  async function tick(i: number, ms = 500) {
    setStepIdx(i); await new Promise(r => setTimeout(r, ms))
  }

  async function handleSubmit() {
    if (!useDemo && !fileA) { setError('Upload your actuals file or enable demo data'); return }
    setIsLoading(true); setError('')
    try {
      await tick(0)
      const fileName = useDemo ? 'demo_data.csv' : fileA!.name
      let data: Record<string, unknown>[]
      if (useDemo) {
        data = FPA_DEMO as Record<string, unknown>[]
      } else {
        if (fileA!.name.toLowerCase().endsWith('.pdf')) {
  throw new Error('PDF files cannot be parsed directly. Please export your data as CSV from Excel or Google Sheets and upload that instead.')
}
const textA = await fileA!.text()
let rawA = parseCSV(textA)
        if (fileB) {
          const textB = await fileB.text()
          const rawB = parseCSV(textB)
          rawA = rawA.map(a => {
            const match = rawB.find(b =>
              String(b.Department||b.Category||'').toLowerCase() === String(a.Department||a.Category||'').toLowerCase() &&
              String(b.Account||b.Name||'').toLowerCase() === String(a.Account||a.Name||'').toLowerCase() &&
              String(b.Month||b.Period||'').toLowerCase() === String(a.Month||a.Period||'').toLowerCase()
            ) || {}
            return { ...a, Budget: Number((match as Record<string,unknown>).Budget || (match as Record<string,unknown>).Budgeted || a.Budget || 0) }
          })
          data = rawA
        } else {
          data = rawA
        }
      }
      await tick(1); await tick(2)
      const analysis = calcFPA(data)
      await tick(3)
      const commentary = buildFPACommentary(analysis)
      await tick(4, 200)
      sessionStorage.setItem('cfopack_fpa', JSON.stringify({ analysis, commentary }))
      saveFPAReport({ analysis, commentary, fileName }).catch(() => {})
await new Promise(r => setTimeout(r, 2000))
router.push('/report?type=fpa')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed.')
      setIsLoading(false)
    }
  }

  if (isLoading) return (
    <div style={{ minHeight:'100vh', background:'#070D18', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24 }}>
      <div style={{ width:56, height:56, border:'2px solid #1C2E45', borderTopColor:'#00C8F0', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
      <p style={{ color:'#E6EDF6', fontWeight:600, fontSize:16 }}>{STEPS[stepIdx]}</p>
      <div style={{ display:'flex', gap:6 }}>
        {STEPS.map((_, i) => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:i<=stepIdx?'#00C8F0':'#1C2E45', transition:'background .3s' }}/>)}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#070D18' }}>
      <div style={{ maxWidth:660, margin:'0 auto', padding:'80px 22px 60px' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <h1 style={{ fontSize:28, fontWeight:700, marginBottom:8, color:'#E6EDF6' }}>FP&amp;A Report</h1>
          <p style={{ color:'#607898', fontSize:14 }}>Upload Budget &amp; Actuals or use demo data</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
          {[{label:'Actuals / Combined', key:'A'},{label:'Budget File (optional)', key:'B'}].map(({label,key}) => (
            <div key={key} onClick={()=>document.getElementById('file'+key)?.click()}
              style={{ border:'2px dashed #1C2E45', borderRadius:11, padding:28, textAlign:'center', cursor:'pointer' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='#00C8F0'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='#1C2E45'}>
              <input id={'file'+key} type="file" accept=".csv,.txt,.pdf,.xlsx,.xls" style={{ display:'none' }}
                onChange={e=>{if(e.target.files?.[0]) key==='A'?setFileA(e.target.files[0]):setFileB(e.target.files[0])}}/>
              <p style={{ fontWeight:600, fontSize:13, color:'#E6EDF6', marginBottom:4 }}>{label}</p>
              <p style={{ color:(key==='A'?fileA:fileB)?'#00DFA0':'#607898', fontSize:12 }}>
                {(key==='A'?fileA:fileB)?.name||'Click to upload'}
              </p>
            </div>
          ))}
        </div>
        <div style={{ background:'#101B2B', border:'1px solid #1C2E45', borderRadius:11, padding:'13px 16px', marginBottom:14, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}
          onClick={()=>setUseDemo(!useDemo)}>
          <div style={{ width:17, height:17, borderRadius:4, border:`2px solid ${useDemo?'#00C8F0':'#1C2E45'}`, background:useDemo?'#00C8F0':'transparent', flexShrink:0 }}/>
          <div>
            <p style={{ fontWeight:600, fontSize:13, color:'#E6EDF6' }}>Use sample demo data</p>
            <p style={{ color:'#607898', fontSize:11 }}>3-month P&amp;L — no upload needed</p>
          </div>
        </div>
        {error && <div style={{ background:'rgba(255,64,96,.1)', border:'1px solid rgba(255,64,96,.3)', borderRadius:8, padding:'10px 14px', color:'#FF4060', fontSize:13, marginBottom:16 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={!useDemo&&!fileA}
          style={{ width:'100%', padding:14, borderRadius:10, fontSize:15, fontWeight:700, border:'none',
            background:'linear-gradient(135deg,#00C8F0,#0088aa)', color:'#000',
            opacity:(!useDemo&&!fileA)?0.5:1, cursor:(!useDemo&&!fileA)?'not-allowed':'pointer' }}>
          Generate FP&amp;A Report →
        </button>
        <div style={{ marginTop:16, textAlign:'center' }}>
          <a href="/dashboard" style={{ color:'#607898', fontSize:13, textDecoration:'none' }}>← Back to dashboard</a>
        </div>
      </div>
    </div>
  )
}