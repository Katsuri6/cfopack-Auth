import type { FPAAnalysis, FPACommentary, FinAnalysis, FinCommentary } from '@/types'

const SUPA_URL  = 'https://xgfhumfwinvsvqqhzhoa.supabase.co'
const ANON_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZmh1bWZ3aW52c3ZxcWh6aG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDIwMzYsImV4cCI6MjA5NTQxODAzNn0.iPms8GJXP7SYA_jad6f3OEFgSdLQ73gELUSUeMucioY'

function getAuthInfo(): { token: string; userId: string } | null {
  try {
    const raw = localStorage.getItem('sb-xgfhumfwinvsvqqhzhoa-auth-token')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const token  = parsed.access_token
    const userId = parsed.user?.id
    if (!token || !userId) return null
    return { token, userId }
  } catch { return null }
}

async function insertReport(body: Record<string, unknown>): Promise<string | null> {
  const auth = getAuthInfo()
  if (!auth) { console.error('saveReport: no auth'); return null }

  const payload = { ...body, user_id: auth.userId }

  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        'apikey':        ANON_KEY,
        'Authorization': 'Bearer ' + auth.token,
        'Content-Type':  'application/json',
        'Prefer':        'return=representation',
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) { console.error('saveReport failed:', JSON.stringify(data)); return null }
    console.log('Report saved! id:', data[0]?.id, 'type:', body.report_type)
    return data[0]?.id || null
  } catch (e) { console.error('saveReport exception:', e); return null }
}

type FPAParams = { analysis: FPAAnalysis; commentary: FPACommentary; fileName: string }
type FinParams = { analysis: FinAnalysis; commentary: FinCommentary; fileName: string }

export async function saveFPAReport({ analysis, commentary }: FPAParams): Promise<string | null> {
  return insertReport({
    title:        'FPA Report — ' + analysis.months.join(', '),
    report_type:  'fpa',
    status:       'complete',
    result:       { analysis, commentary },
    snapshot:     { totalRevenue: analysis.kpis.aRev, overallRating: commentary.overallRating, periods: analysis.months },
    period_start: analysis.months[0] || null,
    period_end:   analysis.months[analysis.months.length - 1] || null,
  })
}

export async function saveFinReport({ analysis, commentary }: FinParams): Promise<string | null> {
  const last = analysis.periodData[analysis.periodData.length - 1]
  return insertReport({
    title:        'Financial Analysis — ' + analysis.periods.join(', '),
    report_type:  'financial',
    status:       'complete',
    result:       { analysis, commentary },
    snapshot:     { totalRevenue: analysis.totalRev, grossMargin: last?.grossMargin ?? null, opMargin: last?.opMargin ?? null, periods: analysis.periods },
    period_start: analysis.periods[0] || null,
    period_end:   analysis.periods[analysis.periods.length - 1] || null,
  })
}