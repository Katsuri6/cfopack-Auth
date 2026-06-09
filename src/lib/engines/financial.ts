import type { FinRecord, FinAnalysis, FinPeriodData, FinAccount, FinAnomaly, FinCommentary, MarginInsight } from '@/types'

// ─── Keyword classifiers ──────────────────────────────────────────────────────
const REV_KW  = ['revenue','sales','income','turnover','licensing','receipts','service income','product revenue','services revenue']
const COGS_KW = ['cost of goods','cogs','direct labor','raw material','material','manufacturing','hosting','cloud','infra','cost of sales','direct cost']
const OPEX_KW = ['salary','wage','rent','electricity','utility','telephone','internet','insurance','depreciation','amortis','marketing','advertising','r&d','research','g&a','general','admin','professional','audit','legal','travel','software','subscription']
const MONTHS  = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec','q1','q2','q3','q4']

export function classifyAccount(name: string, cat?: string): string {
  if (cat) {
    const cl = cat.trim().toLowerCase()
    if (['revenue','income','sales'].includes(cl))             return 'Revenue'
    if (['cogs','cost of goods','cost of sales'].includes(cl)) return 'COGS'
    if (['opex','operating expenses','expenses'].includes(cl)) return 'OpEx'
    if (cl === 'assets')      return 'Assets'
    if (cl === 'liabilities') return 'Liabilities'
    if (cl === 'equity')      return 'Equity'
  }
  const n = `${name} ${cat || ''}`.toLowerCase()
  if (REV_KW.some(w => n.includes(w)))  return 'Revenue'
  if (COGS_KW.some(w => n.includes(w))) return 'COGS'
  if (OPEX_KW.some(w => n.includes(w))) return 'OpEx'
  if (['cash','bank','receivable','inventory','asset','property','equipment','fixed','prepaid','deposit'].some(w => n.includes(w))) return 'Assets'
  if (['payable','loan','liability','creditor','borrowing','overdraft','accrual','provision'].some(w => n.includes(w))) return 'Liabilities'
  if (['equity','capital','retained','reserve','shareholder','dividend'].some(w => n.includes(w))) return 'Equity'
  return 'Other'
}

export function isRevenue(cat: string): boolean {
  const c = (cat || '').toLowerCase().trim()
  return c === 'revenue' || c === 'income' || c === 'sales'
}

function findKey(keys: string[], ...patterns: string[]): string | null {
  const kl = keys.map(k => k.toLowerCase())
  for (const p of patterns) {
    const i = kl.findIndex(k => k.includes(p))
    if (i >= 0) return keys[i]
  }
  return null
}

/** Parse raw rows into financial records */
export function calcFIN(raw: Record<string, unknown>[]): FinAnalysis {
  if (!raw.length) throw new Error('No data rows found')

  const keys  = Object.keys(raw[0])
  const mCols = keys.filter(k => MONTHS.some(m => k.toLowerCase().startsWith(m)))
  const isWide = mCols.length >= 2

  const records: FinRecord[] = []

  if (isWide) {
    const acctKey = findKey(keys, 'account', 'description', 'name', 'particulars') || keys[0]
    const catKey  = findKey(keys, 'category', 'type', 'department', 'group')
    raw.forEach(row => {
      const acct    = String(row[acctKey] || row[keys[0]] || 'Unknown')
      const catRaw  = catKey ? String(row[catKey] || '') : ''
      const category = classifyAccount(acct, catRaw)
      mCols.forEach(m => {
        const val = Number(row[m])
        if (!isNaN(val) && val !== 0) records.push({ account: acct, category, period: m, amount: val })
      })
    })
  } else {
    const acctKey   = findKey(keys, 'account', 'description', 'name', 'particulars') || keys[0]
    const catKey    = findKey(keys, 'category', 'type', 'department')
    const amtKey    = findKey(keys, 'amount', 'value', 'actual', 'credit')
    const periodKey = findKey(keys, 'month', 'period', 'date')
    raw.forEach(row => {
      const acct    = String(row[acctKey] || 'Unknown')
      const catRaw  = catKey ? String(row[catKey] || '') : ''
      const cat     = classifyAccount(acct, catRaw)
      const amt     = amtKey ? Number(row[amtKey] || 0) : 0
      if (amt !== 0) records.push({ account: acct, category: cat, period: periodKey ? String(row[periodKey] || 'Current') : 'Current', amount: amt })
    })
  }

  const periods = [...new Set(records.map(r => r.period))]
  const isRev   = (r: FinRecord) => isRevenue(r.category)

  const periodData: FinPeriodData[] = periods.map(p => {
    const pr   = records.filter(r => r.period === p)
    const rev  = pr.filter(isRev).reduce((s, r) => s + Math.abs(r.amount), 0)
    const cogs = pr.filter(r => r.category === 'COGS').reduce((s, r) => s + Math.abs(r.amount), 0)
    const costs= pr.filter(r => !isRev(r)).reduce((s, r) => s + Math.abs(r.amount), 0)
    const gross = rev - cogs, op = rev - costs
    return { period: p, revenue: rev, costs, cogs, grossProfit: gross, operatingProfit: op, grossMargin: rev ? (gross/rev)*100 : 0, opMargin: rev ? (op/rev)*100 : 0 }
  })

  const acctMap = new Map<string, FinAccount>()
  records.forEach(r => {
    if (!acctMap.has(r.account)) acctMap.set(r.account, { account: r.account, category: r.category, total: 0, byPeriod: {} })
    const a = acctMap.get(r.account)!
    a.total += Math.abs(r.amount)
    a.byPeriod[r.period] = (a.byPeriod[r.period] || 0) + Math.abs(r.amount)
  })

  const accounts     = [...acctMap.values()].sort((a, b) => b.total - a.total)
  const totalRev     = periodData.reduce((s, p) => s + p.revenue, 0)
  const costAccounts = accounts.filter(a => !isRevenue(a.category))

  const anomalies: FinAnomaly[] = []
  accounts.forEach(a => {
    const vals = periods.map(p => a.byPeriod[p] || 0)
    if (vals.length < 2) return
    const prev = vals[vals.length - 2], latest = vals[vals.length - 1]
    if (!prev) return
    const change = ((latest - prev) / Math.abs(prev)) * 100
    if (Math.abs(change) > 20) anomalies.push({ account: a.account, category: a.category, change, latest, prev })
  })

  const growthRows = []
  if (periodData.length >= 2) {
    const last = periodData[periodData.length - 1]
    const prev = periodData[periodData.length - 2]
    for (const [name, l, p] of [['Revenue', last.revenue, prev.revenue], ['Gross Profit', last.grossProfit, prev.grossProfit], ['Operating Profit', last.operatingProfit, prev.operatingProfit], ['Total Costs', last.costs, prev.costs]] as [string, number, number][]) {
      growthRows.push({ name, latest: l, prior: p, growth: p ? ((l - p) / Math.abs(p)) * 100 : 0 })
    }
  }

  return { records, periods, periodData, accounts, costAccounts, anomalies, growthRows, totalRev }
}

/** Build data-driven commentary from financial analysis */
export function buildFinCommentary(fin: FinAnalysis): FinCommentary {
  const { periodData: pd, costAccounts, anomalies, totalRev } = fin
  const fK = (n: number) => { const s=n<0?'-':'',v=Math.abs(n); if(v>=1e6)return`${s}$${(v/1e6).toFixed(1)}M`; if(v>=1e3)return`${s}$${Math.round(v/1e3)}K`; return`${s}$${Math.round(v)}`}
  const fP = (n: number) => `${n>=0?'+':''}${n.toFixed(1)}%`
  const fX = (n: number) => `${n.toFixed(1)}%`

  if (!pd.length) return { diagnostic: 'No period data.', marginInsights: [], recommendations: [] }
  const last = pd[pd.length - 1], first = pd[0]
  const revGrowth = first.revenue ? ((last.revenue - first.revenue) / first.revenue) * 100 : 0
  const gmChg = last.grossMargin - first.grossMargin
  const top   = costAccounts[0], top2 = costAccounts[1]

  const marginInsights: MarginInsight[] = [
    top && totalRev
      ? { severity: top.total/totalRev > 0.25 ? 'high' : 'medium', type: top.total/totalRev > 0.25 ? 'red' : 'amb', text: `${top.account} consumes ${fX((top.total/totalRev)*100)} of revenue — the single largest cost line.` }
      : { severity: 'medium', type: 'amb', text: 'Review the largest cost lines as a proportion of revenue.' },
    gmChg < -2
      ? { severity: 'high', type: 'red', text: `Gross margin compressed ${fP(Math.abs(gmChg))}pp from ${fX(first.grossMargin)} to ${fX(last.grossMargin)} — costs of goods growing faster than pricing.` }
      : { severity: 'positive', type: 'grn', text: `Gross margin is holding at ${fX(last.grossMargin)}, indicating stable pricing power.` },
    top2 && totalRev
      ? { severity: 'medium', type: 'amb', text: `${top2.account} represents ${fX((top2.total/totalRev)*100)} of revenue. Monitor whether this scales proportionally.` }
      : { severity: 'positive', type: 'grn', text: 'Secondary cost lines appear well-managed.' },
    anomalies.length > 0
      ? { severity: 'medium', type: Math.abs(anomalies[0].change) > 40 ? 'red' : 'amb', text: `${anomalies[0].account} showed a ${fP(Math.abs(anomalies[0].change))} ${anomalies[0].change > 0 ? 'increase' : 'decrease'} period-over-period — investigate root cause.` }
      : { severity: 'positive', type: 'grn', text: 'No significant anomalies detected. All line items within normal variance ranges.' },
  ]

  return {
    headline: `Revenue ${revGrowth >= 0 ? 'grows' : 'declines'} ${fP(Math.abs(revGrowth))} with ${fX(last.grossMargin)} gross margin`,
    diagnostic: `Revenue has ${revGrowth >= 0 ? 'grown' : 'declined'} ${fP(Math.abs(revGrowth))} from ${fK(first.revenue)} to ${fK(last.revenue)}. Gross margin is ${gmChg < -1 ? 'compressing' : 'stable'} at ${fX(last.grossMargin)} (${fP(gmChg)}pp change). Operating margin stands at ${fX(last.opMargin)}. ${top ? `${top.account} is the largest cost driver at ${fX(totalRev ? (top.total/totalRev)*100 : 0)} of revenue.` : ''}`,
    marginInsights,
    recommendations: [
      top ? `Review ${top.account} — at ${fX(totalRev ? (top.total/totalRev)*100 : 0)} of revenue it is the highest-leverage cost optimisation target` : 'Review top 3 cost lines for efficiency gains',
      gmChg < -1 ? `Address gross margin compression of ${fP(Math.abs(gmChg))}pp — investigate pricing, supplier costs and product mix` : 'Maintain gross margin discipline and monitor for cost inflation signals',
      `Build a 12-month rolling forecast incorporating the ${fP(revGrowth)} revenue growth trend and ${fX(last.opMargin)} operating margin`,
      anomalies.length > 0 ? `Investigate the ${fP(Math.abs(anomalies[0].change))} movement in ${anomalies[0].account} — determine if structural or one-off` : 'Implement monthly variance reporting to detect anomalies earlier',
    ],
  }
}
