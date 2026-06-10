export const runtime = 'nodejs'
export const maxDuration = 30

/* eslint-disable @typescript-eslint/no-require-imports */
const pdfParse = require('pdf-parse')

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const pdfData = await pdfParse(buffer)
    const text = pdfData.text

    const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0)
    const rows: string[] = []
    rows.push('Department,Account,Month,Actual,Budget')

    for (const line of lines) {
      // Split by 2+ spaces to handle columns separated by spaces
      const parts = line.split(/\s{2,}/).map((p: string) => p.trim()).filter((p: string) => p.length > 0)
      
      // Need at least 3 parts, last two should be numbers
      if (parts.length < 3) continue
      
      const last = parts[parts.length - 1].replace(/,/g, '')
      const secondLast = parts[parts.length - 2].replace(/,/g, '')
      
      const actual = parseFloat(secondLast)
      const budget = parseFloat(last)
      
      // Skip if last two parts aren't numbers
      if (isNaN(actual) || isNaN(budget)) continue
      // Skip header rows
      if (line.toLowerCase().includes('actual') && line.toLowerCase().includes('budget')) continue

      // Remaining parts form the label
      const labelParts = parts.slice(0, parts.length - 2)
      const account = labelParts[0] || 'General'
      const department = labelParts[1] || 'General'
      const month = labelParts[2] || 'Period1'

      rows.push(`${department},"${account}",${month},${actual},${budget}`)
    }

    if (rows.length < 2) {
      return NextResponse.json({ error: 'No financial data found in PDF. Please ensure the PDF contains text-based financial tables.' }, { status: 400 })
    }

    return NextResponse.json({ csv: rows.join('\n') })

  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Parse failed' }, { status: 500 })
  }
}