'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const sb = createClient()
      const { error: err } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (err) {
        if (err.message.includes('already registered')) {
          setError('This email already has an account. Try signing in.')
        } else {
          setError(err.message)
        }
        setLoading(false)
        return
      }
      window.location.href = '/auth/login?message=Account created! Please sign in.'
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  if (done) return (
    <div style={{ minHeight:'100vh', background:'#070D18', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400, background:'#101B2B', border:'1px solid #1C2E45', borderRadius:16, padding:36, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📬</div>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#E6EDF6', marginBottom:10 }}>Check your email!</h1>
        <p style={{ color:'#607898', fontSize:13, lineHeight:1.7, marginBottom:24 }}>
          We sent a confirmation link to <strong style={{ color:'#E6EDF6' }}>{email}</strong>. Click it to activate your account.
        </p>
        <a href="/auth/login" style={{ display:'block', padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#00C8F0,#0088aa)', color:'#000', fontWeight:700, fontSize:14, textDecoration:'none' }}>
          Go to sign in →
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#070D18', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400, background:'#101B2B', border:'1px solid #1C2E45', borderRadius:16, padding:36 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#E6EDF6', textAlign:'center', marginBottom:6 }}>Create your account</h1>
        <p style={{ color:'#607898', fontSize:13, textAlign:'center', marginBottom:24 }}>Start with 5 free reports — no credit card needed</p>

        {error && (
          <div style={{ background:'rgba(255,64,96,.1)', border:'1px solid rgba(255,64,96,.3)', borderRadius:8, padding:'10px 14px', color:'#FF4060', fontSize:13, marginBottom:16 }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display:'block', fontSize:12, color:'#607898', fontWeight:600, marginBottom:6 }}>Full name</label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Jane Smith" required
            style={{ width:'100%', background:'#0C1420', border:'1px solid #1C2E45', borderRadius:8, padding:'10px 13px', color:'#E6EDF6', fontSize:14, outline:'none', marginBottom:16, boxSizing:'border-box' as const }}
          />

          <label style={{ display:'block', fontSize:12, color:'#607898', fontWeight:600, marginBottom:6 }}>Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="jane@company.com" required
            style={{ width:'100%', background:'#0C1420', border:'1px solid #1C2E45', borderRadius:8, padding:'10px 13px', color:'#E6EDF6', fontSize:14, outline:'none', marginBottom:16, boxSizing:'border-box' as const }}
          />

          <label style={{ display:'block', fontSize:12, color:'#607898', fontWeight:600, marginBottom:6 }}>Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 8 characters" minLength={8} required
            style={{ width:'100%', background:'#0C1420', border:'1px solid #1C2E45', borderRadius:8, padding:'10px 13px', color:'#E6EDF6', fontSize:14, outline:'none', marginBottom:8, boxSizing:'border-box' as const }}
          />

          {password.length > 0 && (
            <div style={{ height:3, background:'#1C2E45', borderRadius:2, marginBottom:20, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:2, transition:'all .3s',
                width: password.length >= 12 ? '100%' : password.length >= 8 ? '60%' : '30%',
                background: password.length >= 12 ? '#00DFA0' : password.length >= 8 ? '#FFB020' : '#FF4060',
              }}/>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{ width:'100%', padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#00C8F0,#0088aa)', color:'#000', fontWeight:700, fontSize:14, border:'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: password.length === 0 ? 16 : 0 }}
          >
            {loading ? 'Creating account…' : 'Create account →'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, color:'#607898', fontSize:13 }}>
          Already have an account?{' '}
          <a href="/auth/login" style={{ color:'#00C8F0', textDecoration:'none', fontWeight:600 }}>Sign in →</a>
        </p>
      </div>
    </div>
  )
}