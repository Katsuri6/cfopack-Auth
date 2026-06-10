export const runtime = 'nodejs'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()

    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    
    // Disable worker entirely for server-side use
    const pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.mjs')
    pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker.WorkerMessageHandler() as unknown as Worker

    const pdf = await pdfjsLib.getDocument({ 
      data: new Uint8Array(bytes),
      useWorkerFetch: false, 
      isEvalSupported: false, 
      useSystemFonts: true,
      disableFontFace: true,
    }).promise

    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: Record<string, unknown>) => (item.str as string) || '')
        .join(' ')
      fullText += pageText + '\n'
    }

    if (!fullText.trim()) {
      return NextResponse.json({ error: 'No text extracted from PDF' }, { status: 400 })
    }

    const lines = fullText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0)
    const rows: string[] = []
    rows.push('Department,Account,Month,Actual,Budget')

    for (const line of lines) {
      const parts = line.split(/\s{2,}/).map((p: string) => p.trim()).filter((p: string) => p.length > 0)
      if (parts.length < 3) continue
      const last = parseFloat(parts[parts.length - 1].replace(/,/g, ''))
      const secondLast = parseFloat(parts[parts.length - 2].replace(/,/g, ''))
      if (isNaN(last) || isNaN(secondLast)) continue
      if (line.toLowerCase().includes('actual') && line.toLowerCase().includes('budget')) continue
      const account = parts[0]
      const department = parts[1] || 'General'
      const month = parts[2] || 'Period1'
      rows.push(`${department},"${account}",${month},${secondLast},${last}`)
    }

    if (rows.length < 2) {
      return NextResponse.json({ error: 'No financial data found. Text: ' + fullText.substring(0, 300) }, { status: 400 })
    }

    return NextResponse.json({ csv: rows.join('\n') })

  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Parse failed' }, { status: 500 })
  }
}