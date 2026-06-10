export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Extract raw text from PDF buffer by finding text stream content
    const pdfText = buffer.toString('latin1')
    const textChunks: string[] = []
    
    // Extract text between BT and ET markers (PDF text blocks)
    const btEtRegex = /BT([\s\S]*?)ET/g
    let match
    while ((match = btEtRegex.exec(pdfText)) !== null) {
      const block = match[1]
      // Extract strings in parentheses
      const strRegex = /\(([^)]*)\)/g
      let strMatch
      while ((strMatch = strRegex.exec(block)) !== null) {
        const str = strMatch[1].trim()
        if (str.length > 0) textChunks.push(str)
      }
    }

    const lines = textChunks.join(' ').split(/\s{2,}/).map(l => l.trim()).filter(l => l.length > 1)
    const rows: string[] = []
    rows.push('Department,Account,Month,Actual,Budget')

    for (const line of lines) {
      const numbers = line.match(/[\d,]+\.?\d*/g)
      if (!numbers || numbers.length < 1) continue
      const nums = numbers.map(n => parseFloat(n.replace(/,/g, ''))).filter(n => !isNaN(n) && n > 0)
      if (nums.length < 1) continue
      const label = line.replace(/[\d,.$%()/-]+/g, '').trim().replace(/\s+/g, ' ')
      if (!label || label.length < 2) continue
      const actual = nums[0] || 0
      const budget = nums[1] || 0
      rows.push(`General,"${label}",Period1,${actual},${budget}`)
    }

    if (rows.length < 2) {
      return NextResponse.json({ error: 'No financial data found in PDF. Please ensure the PDF contains text-based financial tables.' }, { status: 400 })
    }

    return NextResponse.json({ csv: rows.join('\n') })

  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Parse failed' }, { status: 500 })
  }
}