'use client'
import { useRef, useState } from 'react'

interface UploadZoneProps {
  label: string
  accept?: string
  hint?: string
  file: File | null
  onChange: (f: File | null) => void
  color?: 'acc' | 'pur'
}

export default function UploadZone({ label, accept = '.csv,.txt', hint, file, onChange, color = 'acc' }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const accentColor = color === 'pur' ? '#9B7FFF' : '#00C8F0'
  const accentBg    = color === 'pur' ? 'rgba(155,127,255,.1)' : 'rgba(0,200,240,.09)'
  const accentBdr   = color === 'pur' ? 'rgba(155,127,255,.2)' : 'rgba(0,200,240,.2)'

  return (
    <div
      className={`upload-zone ${color === 'pur' ? 'upload-zone-purple' : ''} ${dragging ? 'dragging' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault(); setDragging(false)
        const f = e.dataTransfer.files[0]; if (f) onChange(f)
      }}
    >
      <input
        ref={inputRef} type="file" accept={accept}
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) onChange(e.target.files[0]) }}
      />
      {file ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(0,223,160,.12)', border: '1px solid #00DFA0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#00DFA0" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p style={{ fontWeight: 600, fontSize: 13, color: '#00DFA0' }}>{file.name}</p>
          <p style={{ color: '#607898', fontSize: 11 }}>{(file.size / 1024).toFixed(1)} KB</p>
          <button
            onClick={e => { e.stopPropagation(); onChange(null) }}
            style={{ marginTop: 4, background: 'none', border: 'none', color: '#607898', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
          >Remove</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: accentBg, border: `1px solid ${accentBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: '#E6EDF6' }}>{label}</p>
            <p style={{ color: '#607898', fontSize: 12 }}>Drag &amp; drop or click to browse</p>
          </div>
          {hint && <p style={{ color: '#2E4260', fontSize: 11 }}>{hint}</p>}
          <p style={{ color: '#2E4260', fontSize: 10 }}>.csv &nbsp;·&nbsp; .xlsx &nbsp;·&nbsp; .txt</p>
        </div>
      )}
    </div>
  )
}
