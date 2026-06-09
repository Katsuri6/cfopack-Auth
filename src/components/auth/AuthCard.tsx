/**
 * AuthCard — the centered card wrapper used on all auth pages (login, signup, etc).
 * Contains the logo, title, subtitle, and the form content.
 */
interface AuthCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
  /** Optional extra content below the card */
  footer?: React.ReactNode
}

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#070D18',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Grid background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,200,240,.06), transparent 70%)',
      }}/>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 36, textDecoration: 'none', justifyContent: 'center' }}>
          <div style={{
            width: 32, height: 32, background: '#00C8F0', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L5.5 6L9 10L11.5 7" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11.5" cy="7" r="1.2" fill="#000"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-.02em', color: '#E6EDF6' }}>
            CFO<span style={{ color: '#00C8F0' }}>Pack</span>
          </span>
        </a>

        {/* Card */}
        <div style={{
          background: '#101B2B',
          border: '1px solid #1C2E45',
          borderRadius: 16,
          padding: '36px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,.5)',
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
            {title}
          </h1>
          <p style={{ color: '#607898', fontSize: 13, textAlign: 'center', marginBottom: 28 }}>
            {subtitle}
          </p>
          {children}
        </div>

        {/* Footer links */}
        {footer && (
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
