'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FIN_DEMO } from '@/lib/data/demo'
import { calcFIN, buildFinCommentary } from '@/lib/engines/financial'
import { saveFinReport } from '@/lib/utils/saveReport'

const STEPS = ['Uploading…','Detecting format…','Parsing accounts…','Analysing margins…','Done!']

function parseCSV(text: string): Record<string, unknown>[] {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(/[,\t]/).map(h => h.trim().replace(/^"|"$/g,'').replace(/\r/,''))
  return lines.slice(1).map(line => {
    const vals = line.split(/[,\t]/).map(v => v.trim().replace(/^"|"$/g,'').replace(/\r/,'').replace(/[$,]/g,''))
    const obj: Record<string, unknown> = {}
    headers.forEach((h, i) => {
      const v = vals[i] || ''
      obj[h] = v === '' ? null : isNaN(Number(v)) ? v : Number(v)
    })
    return obj
  }).filter(r => Object.values(r).some(v => v !== null && v !== ''))
}

export default function AnalysisPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [useDemo, setUseDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [error, setError] = useState('')

  async function tick(i: number, ms = 420) {
    setStepIdx(i); await new Promise(r => setTimeout(r, ms))
  }

  async function handleSubmit() {
    if (!useDemo && !file) { setError('Upload a file or enable demo data'); return }
    setIsLoading(true); setError('')
    try {
      for (let i = 0; i < STEPS.length - 1; i++) await tick(i)
      const fileName = useDemo ? 'demo_pl.csv' : file!.name
      let raw: Record<string, unknown>[]
if (useDemo) {
  raw = FIN_DEMO as Record<string, unknown>[]
} else if (file!.name.toLowerCase().endsWith('.pdf')) {
  const fd = new FormData()
  fd.append('file', file!)
  const res = await fetch('/api/parse-pdf', { method: 'POST', body: fd })
  const json = await res.json()
  if (!res.ok || !json.csv) throw new Error(json.error || 'Failed to extract data from PDF')
  raw = parseCSV(json.csv)
} else {
  raw = parseCSV(await file!.text())
}
      const analysis = calcFIN(raw)
      const commentary = buildFinCommentary(analysis)
      try {
  sessionStorage.setItem('cfopack_fin', JSON.stringify({ analysis, commentary }))
} catch {
  // If too large, store only commentary and summary
  const slim = { 
    analysis: { 
      summary: analysis.summary, 
      metrics: analysis.metrics,
      periods: analysis.periods?.slice(0, 6) 
    }, 
    commentary 
  }
  sessionStorage.setItem('cfopack_fin', JSON.stringify(slim))
}
      saveFinReport({ analysis, commentary, fileName }).catch(() => {})
await new Promise(r => setTimeout(r, 2000))
router.push('/report?type=financial')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed.')
      setIsLoading(false)
    }
  }

  if (isLoading) return (
    <div style={{ minHeight:'100vh', background:'#070D18', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24 }}>
      <div style={{ width:56, height:56, border:'2px solid #1C2E45', borderTopColor:'#9B7FFF', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
      <p style={{ color:'#E6EDF6', fontWeight:600, fontSize:16 }}>{STEPS[stepIdx]}</p>
      <div style={{ display:'flex', gap:6 }}>
        {STEPS.map((_, i) => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:i<=stepIdx?'#9B7FFF':'#1C2E45', transition:'background .3s' }}/>)}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#070D18' }}>
      <div style={{ maxWidth:600, margin:'0 auto', padding:'80px 22px 60px' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <h1 style={{ fontSize:28, fontWeight:700, marginBottom:8, color:'#E6EDF6' }}>Financial Analysis</h1>
          <p style={{ color:'#607898', fontSize:14 }}>P&amp;L, trial balance, bank statement — no budget needed</p>
        </div>
        <div onClick={()=>document.getElementById('finFile')?.click()}
          style={{ border:'2px dashed #1C2E45', borderRadius:11, padding:40, textAlign:'center', cursor:'pointer', marginBottom:14 }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor='#9B7FFF'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor='#1C2E45'}>
          <input id="finFile" type="file" accept="*" style={{ display:'none' }}
  onChange={e=>{if(e.target.files?.[0])setFile(e.target.files[0])}}/>
          <p style={{ fontWeight:600, fontSize:14, color:'#E6EDF6', marginBottom:6 }}>{file?file.name:'Drop your financial file here'}</p>
          <p style={{ color:file?'#00DFA0':'#607898', fontSize:12 }}>{file?`${(file.size/1024).toFixed(1)} KB — ready`:'CSV or Excel · Click to browse'}</p>
        </div>
        <div style={{ background:'#101B2B', border:'1px solid #1C2E45', borderRadius:11, padding:'13px 16px', marginBottom:20, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}
          onClick={()=>setUseDemo(!useDemo)}>
          <div style={{ width:17, height:17, borderRadius:4, border:`2px solid ${useDemo?'#9B7FFF':'#1C2E45'}`, background:useDemo?'#9B7FFF':'transparent', flexShrink:0 }}/>
          <div>
            <p style={{ fontWeight:600, fontSize:13, color:'#E6EDF6' }}>Use sample demo data</p>
            <p style={{ color:'#607898', fontSize:11 }}>6-month P&amp;L — no upload needed</p>
          </div>
        </div>
        {error && <div style={{ background:'rgba(255,64,96,.1)', border:'1px solid rgba(255,64,96,.3)', borderRadius:8, padding:'10px 14px', color:'#FF4060', fontSize:13, marginBottom:16 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={!useDemo&&!file}
          style={{ width:'100%', padding:14, borderRadius:10, fontSize:15, fontWeight:700, border:'none',
            background:'linear-gradient(135deg,#9B7FFF,#6040CC)', color:'#fff',
            opacity:(!useDemo&&!file)?0.5:1, cursor:(!useDemo&&!file)?'not-allowed':'pointer' }}>
          Run Financial Analysis →
        </button>
        <div style={{ marginTop:16, textAlign:'center' }}>
          <a href="/dashboard" style={{ color:'#607898', fontSize:13, textDecoration:'none' }}>← Back to dashboard</a>
        </div>
      </div>
    </div>
  )
}