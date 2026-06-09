'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthCard from '@/components/auth/AuthCard'
import FormField from '@/components/auth/FormField'
import AlertBox from '@/components/auth/AlertBox'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <AuthCard title="Email sent!" subtitle="Check your inbox for the reset link">
        <div style={{ textAlign:'center', padding:'10px 0 20px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
          <p style={{ color:'#607898', fontSize:14, lineHeight:1.7, marginBottom:24 }}>
            We sent a password reset link to <strong style={{ color:'#E6EDF6' }}>{email}</strong>.
            Click the link in the email, then set a new password.
          </p>
          <p style={{ color:'#2E4260', fontSize:12 }}>The link expires in 1 hour. Check your spam folder if you don&apos;t see it.</p>
        </div>
        <a href="/auth/login" className="btn-ghost"
          style={{ display:'block', textAlign:'center', padding:'12px 20px', borderRadius:10, fontSize:14, textDecoration:'none' }}>
          ← Back to sign in
        </a>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send a reset link"
      footer={
        <a href="/auth/login" style={{ color:'#607898', fontSize:13, textDecoration:'none' }}>
          ← Back to sign in
        </a>
      }
    >
      {error && <AlertBox type="error" message={error}/>}

      <form onSubmit={handleReset}>
        <FormField label="Email address" type="email" value={email} onChange={setEmail}
          placeholder="you@company.com" autoComplete="email" required/>

        <button type="submit" className="btn-primary" disabled={loading || !email}
          style={{ width:'100%', padding:'12px 20px', borderRadius:10, fontSize:14,
            opacity:(loading||!email)?0.6:1, cursor:(loading||!email)?'not-allowed':'pointer' }}>
          {loading
            ? <><Spin/> Sending…</>
            : 'Send reset link →'
          }
        </button>
      </form>
    </AuthCard>
  )
}

function Spin() {
  return <span style={{ width:14, height:14, border:'2px solid rgba(0,0,0,.25)', borderTopColor:'#000', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' }}/>
}
