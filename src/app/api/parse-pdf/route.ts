import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 }
            },
            {
              type: 'text',
              text: `Extract all financial data from this PDF into a CSV format. 
Return ONLY a CSV string with these exact columns: Department,Account,Month,Actual,Budget
- Department: the business unit or cost center (use "General" if not specified)
- Account: the line item name (e.g. Revenue, Salaries, Rent, etc.)
- Month: the period (e.g. Jan-2025, or use "Period1" if unclear)
- Actual: the actual amount as a number (no currency symbols or commas)
- Budget: the budget amount as a number (use 0 if not available)
Extract every row of financial data you can find. Return ONLY the CSV, no explanation, no markdown.`
            }
          ]
        }]
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Claude API error')

    const csvText = data.content?.[0]?.text || ''
    return NextResponse.json({ csv: csvText })

  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Parse failed' }, { status: 500 })
  }
}