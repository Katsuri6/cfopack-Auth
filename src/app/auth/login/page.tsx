'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const sb = createClient()

    // Race: login vs 8 second timeout
    const loginPromise = sb.auth.signInWithPassword({ email: email.trim(), password })
    const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 8000))

    const result = await Promise.race([loginPromise, timeoutPromise])

    if (result === null) {
      // Timed out — session may still be set, try going to dashboard
      document.location.href = '/dashboard'
      return
    }

    if (result.error) {
      setError(result.error.message.includes('Invalid') ? 'Wrong email or password.' : result.error.message)
      setLoading(false)
      return
    }

    // Success — go to dashboard
    document.location.href = '/dashboard'
  }

  return (
    <div style={{ minHeight:'100vh', background:'#070D18', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400, background:'#101B2B', border:'1px solid #1C2E45', borderRadius:16, padding:36 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:'#E6EDF6', textAlign:'center', marginBottom:6 }}>Welcome back</h1>
        <p style={{ color:'#607898', fontSize:13, textAlign:'center', marginBottom:24 }}>Sign in to CFO Pack</p>
        {error && (
          <div style={{ background:'rgba(255,64,96,.1)', border:'1px solid rgba(255,64,96,.3)', borderRadius:8, padding:'10px 14px', color:'#FF4060', fontSize:13, marginBottom:16 }}>
            ⚠ {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label style={{ display:'block', fontSize:12, color:'#607898', fontWeight:600, marginBottom:6 }}>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
            placeholder="you@company.com"
            style={{ width:'100%', background:'#0C1420', border:'1px solid #1C2E45', borderRadius:8, padding:'10px 13px', color:'#E6EDF6', fontSize:14, outline:'none', marginBottom:16, boxSizing:'border-box' as const }}/>
          <label style={{ display:'block', fontSize:12, color:'#607898', fontWeight:600, marginBottom:6 }}>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
            placeholder="Your password"
            style={{ width:'100%', background:'#0C1420', border:'1px solid #1C2E45', borderRadius:8, padding:'10px 13px', color:'#E6EDF6', fontSize:14, outline:'none', marginBottom:24, boxSizing:'border-box' as const }}/>
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#00C8F0,#0088aa)', color:'#000', fontWeight:700, fontSize:14, border:'none', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1 }}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>
        {loading && (
          <p style={{ textAlign:'center', color:'#607898', fontSize:12, marginTop:12 }}>
            Please wait up to 8 seconds…
          </p>
        )}
        <p style={{ textAlign:'center', marginTop:20, color:'#607898', fontSize:13 }}>
          No account? <a href="/auth/signup" style={{ color:'#00C8F0', textDecoration:'none', fontWeight:600 }}>Sign up free →</a>
        </p>
      </div>
    </div>
  )
}