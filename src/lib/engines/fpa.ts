import type { FPARow, FPAAnalysis, FPAKPIs, FPAMonthly } from '@/types'

/** Classify a row as Revenue or non-revenue */
function isRevDept(dept: string): boolean {
  const d = dept.toLowerCase()
  return d.includes('revenue') || d.includes('income') || d.includes('sales')
}

/** Run full FP&A variance engine on raw data */
export function calcFPA(raw: Record<string, unknown>[]): FPAAnalysis {
  // Find column names case-insensitively
  const keys = Object.keys(raw[0] || {})
  const find  = (...opts: string[]) => keys.find(k => opts.some(o => k.toLowerCase().includes(o.toLowerCase()))) || opts[0]

  const deptKey  = find('department', 'dept', 'category')
  const acctKey  = find('account', 'description', 'name')
  const budgKey  = find('budget', 'budgeted', 'plan')
  const actKey   = find('actual', 'actuals')
  const monthKey = find('month', 'period')

  const tagged: FPARow[] = raw
    .map(r => {
      const dept   = String(r[deptKey]  || 'Other')
      const acct   = String(r[acctKey]  || 'Unknown')
      const budget = Number(r[budgKey]  || 0)
      const actual = Number(r[actKey]   || 0)
      const month  = String(r[monthKey] || 'N/A')
      const v      = actual - budget
      const vp     = budget !== 0 ? (v / Math.abs(budget)) * 100 : 0
      const fav    = isRevDept(dept) ? actual >= budget : actual <= budget
      return { Department: dept, Account: acct, Budget: budget, Actual: actual, Month: month, v, vp, fav }
    })
    .filter(r => r.Budget !== 0 || r.Actual !== 0)

  const months = [...new Set(tagged.map(r => r.Month))]

  const monthly: FPAMonthly[] = months.map(m => {
    const mr  = tagged.filter(r => r.Month === m)
    const sum = (key: 'Budget' | 'Actual', rev: boolean) =>
      mr.filter(r => isRevDept(r.Department) === rev).reduce((s, r) => s + r[key], 0)
    const bR = sum('Budget', true),  aR = sum('Actual', true)
    const bC = sum('Budget', false), aC = sum('Actual', false)
    return { Month: m, bRev: bR, aRev: aR, bEB: bR - bC, aEB: aR - aC }
  })

  const revRows  = tagged.filter(r => isRevDept(r.Department))
  const costRows = tagged.filter(r => !isRevDept(r.Department))
  const bR = revRows.reduce( (s, r) => s + r.Budget, 0)
  const aR = revRows.reduce( (s, r) => s + r.Actual, 0)
  const bC = costRows.reduce((s, r) => s + r.Budget, 0)
  const aC = costRows.reduce((s, r) => s + r.Actual, 0)

  const expByDept: Record<string, number> = {}
  costRows.forEach(r => { expByDept[r.Department] = (expByDept[r.Department] || 0) + r.Actual })

  const kpis: FPAKPIs = {
    bRev: bR, aRev: aR, bCost: bC, aCost: aC,
    bEB: bR - bC, aEB: aR - aC,
    revVar:  aR - bR,  revVarP:  bR ? ((aR - bR) / bR) * 100 : 0,
    expVar:  aC - bC,  expVarP:  bC ? ((aC - bC) / bC) * 100 : 0,
    ebVar:  (aR - aC) - (bR - bC),
    ebVarP: (bR - bC) ? ((aR - aC - (bR - bC)) / Math.abs(bR - bC)) * 100 : 0,
    burn: months.length ? aC / months.length : 0,
  }

  return { rows: tagged, monthly, months, expByDept, kpis }
}

/** Build data-driven commentary from FPA analysis */
export function buildFPACommentary(a: FPAAnalysis) {
  const k = a.kpis
  const fK = (n: number) => { const s=n<0?'-':'',v=Math.abs(n); if(v>=1e6)return`${s}$${(v/1e6).toFixed(1)}M`; if(v>=1e3)return`${s}$${Math.round(v/1e3)}K`; return`${s}$${Math.round(v)}`}
  const fP = (n: number) => `${n>=0?'+':''}${n.toFixed(1)}%`

  const topFav   = [...a.rows].filter(r => r.fav) .sort((x,y) => Math.abs(y.v) - Math.abs(x.v)).slice(0, 2)
  const topUnfav = [...a.rows].filter(r => !r.fav).sort((x,y) => Math.abs(y.v) - Math.abs(x.v)).slice(0, 2)
  const rating: 'Favorable'|'Unfavorable'|'Mixed' =
    k.ebVar >= 0 ? 'Favorable' : k.ebVar >= -k.bEB * 0.05 ? 'Mixed' : 'Unfavorable'

  return {
    headline: `${rating} quarter as revenue ${k.revVar >= 0 ? 'beats' : 'misses'} budget by ${fP(Math.abs(k.revVarP))}`,
    overallRating: rating,
    executiveSummary: `Revenue came in ${k.revVar >= 0 ? 'above' : 'below'} plan at ${fK(k.aRev)} vs budget ${fK(k.bRev)} (${fP(k.revVarP)}). Costs ran at ${fK(k.aCost)} vs budget ${fK(k.bCost)} (${fP(k.expVarP)}). EBITDA finished at ${fK(k.aEB)}, a variance of ${fK(k.ebVar)} (${fP(k.ebVarP)}) against plan.`,
    keyDrivers: [
      topFav[0]  ? `${topFav[0].Account} outperformed by ${fP(topFav[0].vp)} at ${fK(topFav[0].Actual)} vs budget ${fK(topFav[0].Budget)}` : 'Revenue mix broadly in line with plan',
      topFav[1]  ? `${topFav[1].Account} contributed a ${fP(Math.abs(topFav[1].vp))} favorable variance of ${fK(Math.abs(topFav[1].v))}` : 'Cost lines broadly tracked budget',
      topUnfav[0]? `${topUnfav[0].Account} overspent at ${fK(topUnfav[0].Actual)} vs budget ${fK(topUnfav[0].Budget)} (${fP(topUnfav[0].vp)})` : 'No material unfavorable variances identified',
    ],
    costAnalysis: `Total costs of ${fK(k.aCost)} were ${k.expVar >= 0 ? 'above' : 'below'} budget by ${fK(Math.abs(k.expVar))} (${fP(Math.abs(k.expVarP))}). ${topUnfav[0] ? `${topUnfav[0].Account} was the primary driver.` : 'Cost performance broadly in line.'}`,
    cashFlowObservations: `Monthly average burn stands at ${fK(k.burn)}. ${k.expVarP > 5 ? 'Cost trajectory warrants a mid-period reforecast.' : 'Burn rate within acceptable parameters.'}`,
    risksAndOpportunities: {
      risks: [
        topUnfav[0] ? `Continued overspend in ${topUnfav[0].Account} (${fP(topUnfav[0].vp)}) will pressure margins` : 'Monitor cost lines for acceleration above budget',
        `Burn rate of ${fK(k.burn)}/mo should be reviewed if pressures continue`,
      ],
      opportunities: [
        topFav[0] ? `${topFav[0].Account} momentum (${fP(topFav[0].vp)}) — consider accelerating investment` : 'Favorable variances create reinvestment headroom',
        'Procurement and vendor reviews could yield further savings',
      ],
    },
    recommendations: [
      topUnfav[0] ? `Review ${topUnfav[0].Account} spend with department heads to identify savings` : 'Review all cost lines above 5% unfavorable variance',
      topFav[0]   ? `Build on ${topFav[0].Account} outperformance — assess capacity to accelerate` : 'Maintain momentum in outperforming lines',
      'Prepare a full-year reforecast incorporating period actuals',
    ],
  }
}
