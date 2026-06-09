'use client'
import { useEffect, useState } from 'react'

export default function CheckPage() {
  const [url, setUrl]       = useState('')
  const [key, setKey]       = useState('')
  const [status, setStatus] = useState<'testing'|'ok'|'fail'>('testing')
  const [detail, setDetail] = useState('')

  useEffect(() => {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL     || ''
    const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    setUrl(u)
    setKey(k)

    if (!u || !k) {
      setStatus('fail')
      setDetail('Env vars are empty — .env.local is missing or not loaded.')
      return
    }

    fetch(`${u}/rest/v1/`, {
      headers: { apikey: k, Authorization: `Bearer ${k}` },
    })
      .then(r  => { setStatus('ok');   setDetail(`HTTP ${r.status} — Supabase reachable!`) })
      .catch(e => { setStatus('fail'); setDetail(e.message) })
  }, [])

  return (
    <div style={{ minHeight:'100vh', background:'#070D18', display:'flex',
      alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:520 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#E6EDF6', marginBottom:6 }}>
          🔍 Connection Check
        </h1>
        <p style={{ color:'#607898', fontSize:13, marginBottom:24 }}>
          Diagnosing your Supabase setup
        </p>

        <div style={{ background:'#101B2B', border:'1px solid #1C2E45',
          borderRadius:12, overflow:'hidden', marginBottom:16 }}>

          <Row label="SUPABASE_URL"      val={url || '(empty)'}
            good={url.startsWith('https://') && url.includes('.supabase.co')} />
          <Row label="SUPABASE_ANON_KEY" val={key ? key.slice(0,40)+'…' : '(empty)'}
            good={key.startsWith('eyJ') && key.length > 100} />
          <Row
            label="Live connection test"
            val={detail || 'Testing…'}
            good={status === 'ok'}
            pending={status === 'testing'}
          />
        </div>

        {status === 'fail' && <FixInstructions />}

        {status === 'ok' && (
          <div style={{ background:'rgba(0,223,160,.08)',
            border:'1px solid rgba(0,223,160,.3)', borderRadius:12,
            padding:'20px', textAlign:'center' }}>
            <p style={{ color:'#00DFA0', fontWeight:700, fontSize:16, marginBottom:8 }}>
              ✅ Everything is working!
            </p>
            <p style={{ color:'#607898', fontSize:13, marginBottom:18 }}>
              Supabase is connected. You can now create an account.
            </p>
            <a href="/auth/signup" style={{ display:'inline-block',
              padding:'11px 24px', borderRadius:9,
              background:'linear-gradient(135deg,#00C8F0,#0088aa)',
              color:'#000', fontWeight:700, fontSize:14, textDecoration:'none' }}>
              Go to sign up →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, val, good, pending }: {
  label: string; val: string; good: boolean; pending?: boolean
}) {
  const icon = pending ? '⏳' : good ? '✅' : '❌'
  const color = pending ? '#FFB020' : good ? '#E6EDF6' : '#FF4060'
  return (
    <div style={{ display:'flex', gap:12, padding:'13px 16px',
      borderBottom:'1px solid #1C2E45', alignItems:'flex-start' }}>
      <span style={{ fontSize:15, marginTop:1 }}>{icon}</span>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color, marginBottom:3 }}>{label}</p>
        <p style={{ fontSize:11, color:'#607898', fontFamily:'monospace',
          wordBreak:'break-all' }}>{val}</p>
      </div>
    </div>
  )
}

function FixInstructions() {
  const steps = [
    ['Find your .env.local file',
     'It lives in the ROOT of your cfopack-next folder — same level as package.json. On Mac press Cmd+Shift+. to show hidden files.'],
    ['If it does not exist, create it',
     'In VS Code terminal type:  cp .env.local.example .env.local  and press Enter'],
    ['Get your Supabase keys',
     'Go to supabase.com → your project → Settings → API'],
    ['Copy two values',
     'Project URL  →  paste after NEXT_PUBLIC_SUPABASE_URL=\nanon/public key  →  paste after NEXT_PUBLIC_SUPABASE_ANON_KEY='],
    ['Restart the server',
     'In your terminal: Ctrl+C to stop, then npm run dev to restart. Env vars only load on startup.'],
    ['Refresh this page',
     'Come back to /auth/check — all rows should turn green.'],
  ]

  return (
    <div style={{ background:'rgba(255,64,96,.07)',
      border:'1px solid rgba(255,64,96,.25)', borderRadius:12, padding:'18px' }}>
      <p style={{ fontWeight:700, color:'#FF4060', fontSize:14, marginBottom:14 }}>
        How to fix this:
      </p>
      {steps.map(([title, desc], i) => (
        <div key={i} style={{ display:'flex', gap:11, marginBottom:13 }}>
          <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0,
            background:'rgba(0,200,240,.12)', border:'1px solid rgba(0,200,240,.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontWeight:700, color:'#00C8F0' }}>{i+1}</div>
          <div>
            <p style={{ fontWeight:600, fontSize:13, marginBottom:3,
              color:'#E6EDF6' }}>{title}</p>
            <p style={{ color:'#607898', fontSize:12, lineHeight:1.7,
              whiteSpace:'pre-line' }}>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}