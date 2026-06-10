export const runtime = 'nodejs'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const pdfString = buffer.toString('binary')

    // Extract all readable text from PDF
    const rows: string[] = []
    rows.push('Department,Account,Month,Actual,Budget')

    // Match text in parentheses (PDF text encoding)
    const textMatches = pdfString.match(/\(([^\)]{2,80})\)/g) || []
    const tokens = textMatches
      .map(m => m.slice(1, -1).trim())
      .filter(t => t.length > 1 && /[a-zA-Z0-9]/.test(t))

    // Slide a window looking for: Label, Department, Month, Number, Number
    for (let i = 0; i < tokens.length - 3; i++) {
      const t0 = tokens[i]
      const t1 = tokens[i + 1]
      const t2 = tokens[i + 2]
      const t3 = tokens[i + 3]
      const t4 = tokens[i + 4]

      const n3 = parseFloat(t3?.replace(/,/g, '') || '')
      const n4 = parseFloat(t4?.replace(/,/g, '') || '')

      if (!isNaN(n3) && !isNaN(n4) && n3 > 0 && t0 && t1) {
        // Skip header row
        if (t0.toLowerCase() === 'account') continue
        const month = t2 || 'Period1'
        rows.push(`${t1},"${t0}",${month},${n3},${n4}`)
        i += 4
      }
    }

    if (rows.length < 2) {
      return NextResponse.json({ 
        error: 'No financial data found. Token sample: ' + tokens.slice(0, 20).join(' | '),
      }, { status: 400 })
    }

    return NextResponse.json({ csv: rows.join('\n') })

  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Parse failed' }, { status: 500 })
  }
}