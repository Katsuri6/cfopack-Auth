/**
 * FormField — a labeled input with optional error display.
 * Keeps all the auth forms clean and consistent.
 */
'use client'
import { useState } from 'react'

interface FormFieldProps {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
  autoComplete?: string
  required?: boolean
  hint?: string
}

export default function FormField({
  label, type = 'text', value, onChange, placeholder, error, autoComplete, required, hint,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        color: '#607898', marginBottom: 7, letterSpacing: '.02em',
      }}>
        {label} {required && <span style={{ color: '#FF4060' }}>*</span>}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="form-input"
          style={{
            borderColor: error ? '#FF4060' : undefined,
            paddingRight: isPassword ? 44 : undefined,
          }}
        />
        {/* Show/hide toggle for password fields */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#607898',
              display: 'flex', alignItems: 'center', padding: 4,
            }}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <p style={{ fontSize: 12, color: '#FF4060', marginTop: 6 }}>⚠ {error}</p>
      )}
      {hint && !error && (
        <p style={{ fontSize: 11, color: '#607898', marginTop: 5 }}>{hint}</p>
      )}
    </div>
  )
}
