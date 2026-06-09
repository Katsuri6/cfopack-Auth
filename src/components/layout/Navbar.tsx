'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface NavbarProps {
  showBack?: boolean
  onBack?: () => void
}

export default function Navbar({ showBack, onBack }: NavbarProps) {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
      height: 62, background: 'rgba(7,13,24,.96)',
      backdropFilter: 'blur(20px)', borderBottom: '1px solid #1C2E45',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 22px',
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <button
          onClick={() => router.push(user ? '/dashboard' : '/')}
          style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div style={{ width: 28, height: 28, background: '#00C8F0', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L5.5 6L9 10L11.5 7" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11.5" cy="7" r="1.2" fill="#000"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-.02em', color: '#E6EDF6' }}>
            CFO<span style={{ color: '#00C8F0' }}>Pack</span>
          </span>
        </button>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showBack && (
            <button onClick={onBack || (() => router.back())} className="btn-ghost"
              style={{ padding: '7px 15px', borderRadius: 8, fontSize: 13 }}>
              ← Back
            </button>
          )}

          {!loading && (
            <>
              {user ? (
                /* Logged-in state */
                <>
                  <button onClick={() => router.push('/fpa')} className="btn-primary"
                    style={{ padding: '7px 15px', borderRadius: 8, fontSize: 13 }}>
                    + FP&amp;A
                  </button>
                  <button onClick={() => router.push('/analysis')} className="btn-purple"
                    style={{ padding: '7px 15px', borderRadius: 8, fontSize: 13 }}>
                    + Analysis
                  </button>
                  {/* Avatar */}
                  <button onClick={() => router.push('/dashboard')}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: '#1C2E45', border: '1px solid #2E4260', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: '#00C8F0', flexShrink: 0 }}>
                    {(profile?.full_name || user.email || '?')[0].toUpperCase()}
                  </button>
                </>
              ) : (
                /* Logged-out state */
                <>
                  <button onClick={() => router.push('/auth/login')} className="btn-ghost"
                    style={{ padding: '7px 15px', borderRadius: 8, fontSize: 13 }}>
                    Sign in
                  </button>
                  <button onClick={() => router.push('/auth/signup')} className="btn-primary"
                    style={{ padding: '7px 15px', borderRadius: 8, fontSize: 13 }}>
                    Get started →
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
