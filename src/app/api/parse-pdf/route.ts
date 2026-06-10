import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const pdfData = await pdfParse(buffer)
    const text = pdfData.text

    // Try to extract financial table rows from raw text
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    const rows: string[] = []
    rows.push('Department,Account,Month,Actual,Budget')

    for (const line of lines) {
      // Match lines that contain at least one number (financial data)
      const numbers = line.match(/[\d,]+\.?\d*/g)
      if (!numbers || numbers.length < 1) continue

      // Clean numbers
      const nums = numbers.map(n => parseFloat(n.replace(/,/g, '')))
        .filter(n => !isNaN(n) && n > 0)
      if (nums.length < 1) continue

      // Extract label (non-numeric part)
      const label = line.replace(/[\d,.$%()/-]+/g, '').trim().replace(/\s+/g, ' ')
      if (!label || label.length < 2) continue

      const actual = nums[0] || 0
      const budget = nums[1] || 0

      rows.push(`General,"${label}",Period1,${actual},${budget}`)
    }

    if (rows.length < 2) {
      return NextResponse.json({ error: 'No financial data found in PDF. Please ensure the PDF contains financial tables.' }, { status: 400 })
    }

    return NextResponse.json({ csv: rows.join('\n') })

  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Parse failed' }, { status: 500 })
  }
}