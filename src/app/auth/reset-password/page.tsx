'use client'
import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuthCard from '@/components/auth/AuthCard'
import FormField from '@/components/auth/FormField'
import AlertBox from '@/components/auth/AlertBox'

function ResetForm() {
  const router   = useRouter()
  const supabase = createClient()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)

  const pwMatch  = password === confirm
  const pwStrong = password.length >= 8

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!pwMatch)  { setError('Passwords do not match.'); return }
    if (!pwStrong) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }

    setSuccess(true)
    setTimeout(() => router.push('/auth/login?message=' + encodeURIComponent('Password updated! Sign in with your new password.')), 2500)
  }

  if (success) {
    return (
      <AuthCard title="Password updated!" subtitle="You can now sign in with your new password">
        <div style={{ textAlign:'center', padding:'10px 0 20px' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
          <p style={{ color:'#607898', fontSize:14 }}>Redirecting you to sign in…</p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Set new password" subtitle="Choose a strong password for your account">
      {error && <AlertBox type="error" message={error}/>}

      <form onSubmit={handleUpdate}>
        <FormField label="New password" type="password" value={password} onChange={setPassword}
          placeholder="At least 8 characters" autoComplete="new-password" required
          hint={password && !pwStrong ? 'At least 8 characters required' : undefined}/>
        <FormField label="Confirm password" type="password" value={confirm} onChange={setConfirm}
          placeholder="Repeat your password" autoComplete="new-password" required
          error={confirm && !pwMatch ? 'Passwords do not match' : undefined}/>

        <button type="submit" className="btn-primary" disabled={loading || !password || !confirm || !pwMatch}
          style={{ width:'100%', padding:'12px 20px', borderRadius:10, fontSize:14,
            opacity:(loading||!password||!confirm||!pwMatch)?0.6:1,
            cursor:(loading||!password||!confirm||!pwMatch)?'not-allowed':'pointer' }}>
          {loading ? <><Spin/> Updating…</> : 'Update password →'}
        </button>
      </form>
    </AuthCard>
  )
}

function Spin() {
  return <span style={{ width:14, height:14, border:'2px solid rgba(0,0,0,.25)', borderTopColor:'#000', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' }}/>
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div style={{ minHeight:'100vh', background:'#070D18' }}/>}><ResetForm/></Suspense>
}
