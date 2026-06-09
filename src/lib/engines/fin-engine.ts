import type { FinAnalysis, FinRecord, FinPeriodData, FinAccount, FinAnomaly } from "@/types"

type RawRow = Record<string, string | number | null>

const REV_KW  = ["revenue","sales","income","turnover","licensing","receipts","service income","product revenue","services revenue"]
const COGS_KW = ["cost of goods","cogs","direct labor","raw material","material","manufacturing","hosting","cloud","infra","cost of sales"]
const OPEX_KW = ["salary","wage","rent","electricity","utility","telephone","internet","insurance","depreciation","marketing","advertising","r&d","research","g&a","general","admin","professional","audit","legal","travel","software","subscription"]
const MONTHS  = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec","q1","q2","q3","q4"]

function classify(name: string, cat?: string): string {
  if (cat) {
    const cl = cat.trim().toLowerCase()
    if (["revenue","income","sales"].includes(cl))              return "Revenue"
    if (["cogs","cost of goods","cost of sales"].includes(cl))  return "COGS"
    if (["opex","operating expenses","expenses"].includes(cl))  return "OpEx"
    if (cl === "assets")      return "Assets"
    if (cl === "liabilities") return "Liabilities"
    if (cl === "equity")      return "Equity"
  }
  const n = (name + " " + (cat || "")).toLowerCase()
  if (REV_KW.some(w  => n.includes(w))) return "Revenue"
  if (COGS_KW.some(w => n.includes(w))) return "COGS"
  if (OPEX_KW.some(w => n.includes(w))) return "OpEx"
  if (["cash","bank","receivable","inventory","asset","property","equipment","fixed","prepaid"].some(w => n.includes(w))) return "Assets"
  if (["payable","loan","liability","creditor","borrowing","overdraft","accrual"].some(w => n.includes(w))) return "Liabilities"
  if (["equity","capital","retained","reserve","shareholder"].some(w => n.includes(w))) return "Equity"
  return "Other"
}

export function isRevenue(cat: string): boolean {
  const c = (cat || "").toLowerCase()
  return c === "revenue" || c === "income" || c === "sales"
}

function findKeyCI(keys: string[], ...candidates: string[]): string | null {
  const kl = keys.map(k => k.toLowerCase())
  for (const c of candidates) {
    const i = kl.findIndex(k => k.includes(c))
    if (i >= 0) return keys[i]
  }
  return null
}

export function calcFIN(raw: RawRow[]): FinAnalysis {
  if (!raw.length) throw new Error("No data rows found")

  const keys  = Object.keys(raw[0])
  const mCols = keys.filter(k => MONTHS.some(m => k.toLowerCase().startsWith(m)))
  const isWide = mCols.length >= 2
  const records: FinRecord[] = []

  if (isWide) {
    const acctKey = findKeyCI(keys, "account","description","name","particulars") || keys[0]
    const catKey  = findKeyCI(keys, "category","type","department","group")
    raw.forEach(row => {
      const acctName = String(row[acctKey] || row[keys[0]] || "Unknown")
      const catRaw   = catKey ? String(row[catKey] || "") : ""
      const category = classify(acctName, catRaw)
      mCols.forEach(m => {
        const val = Number(row[m])
        if (row[m] != null && row[m] !== "" && !isNaN(val) && val !== 0)
          records.push({ account: acctName, category, period: m, amount: val })
      })
    })
  } else {
    const acctKey   = findKeyCI(keys, "account","description","name","particulars") || keys[0]
    const catKey    = findKeyCI(keys, "category","type","department")
    const amtKey    = findKeyCI(keys, "amount","value","actual","credit")
    const periodKey = findKeyCI(keys, "month","period","date")
    raw.forEach(row => {
      const acct    = String(row[acctKey] || "Unknown")
      const catRaw  = catKey ? String(row[catKey] || "") : ""
      const cat     = classify(acct, catRaw)
      const amt     = amtKey ? Number(row[amtKey] || 0) : 0
      if (amt !== 0)
        records.push({ account: acct, category: cat, period: periodKey ? String(row[periodKey] || "Current") : "Current", amount: amt })
    })
  }

  const periods    = [...new Set(records.map(r => r.period))]
  const isRev      = (r: FinRecord) => isRevenue(r.category)

  const periodData: FinPeriodData[] = periods.map(p => {
    const pr   = records.filter(r => r.period === p)
    const rev  = pr.filter(isRev).reduce((s, r) => s + Math.abs(r.amount), 0)
    const cogs = pr.filter(r => r.category === "COGS").reduce((s, r) => s + Math.abs(r.amount), 0)
    const costs= pr.filter(r => !isRev(r)).reduce((s, r) => s + Math.abs(r.amount), 0)
    const gross = rev - cogs, op = rev - costs
    return { period: p, revenue: rev, costs, cogs, grossProfit: gross, operatingProfit: op,
             grossMargin: rev ? (gross / rev) * 100 : 0, opMargin: rev ? (op / rev) * 100 : 0 }
  })

  const acctMap = new Map<string, FinAccount>()
  records.forEach(r => {
    if (!acctMap.has(r.account))
      acctMap.set(r.account, { account: r.account, category: r.category, total: 0, byPeriod: {} })
    const a = acctMap.get(r.account)!
    a.total += Math.abs(r.amount)
    a.byPeriod[r.period] = (a.byPeriod[r.period] || 0) + Math.abs(r.amount)
  })

  const accounts      = [...acctMap.values()].sort((a, b) => b.total - a.total)
  const totalRev      = periodData.reduce((s, p) => s + p.revenue, 0)
  const costAccounts  = accounts.filter(a => !isRevenue(a.category))

  const anomalies: FinAnomaly[] = []
  accounts.forEach(a => {
    const vals = periods.map(p => a.byPeriod[p] || 0)
    if (vals.length < 2) return
    const prev = vals[vals.length - 2], latest = vals[vals.length - 1]
    const chg  = prev ? ((latest - prev) / Math.abs(prev)) * 100 : 0
    if (Math.abs(chg) > 20)
      anomalies.push({ account: a.account, category: a.category, change: chg, latest, prev })
  })

  const growthRows: FinAnalysis["growthRows"] = []
  if (periodData.length >= 2) {
    const last = periodData[periodData.length - 1]
    const prev = periodData[periodData.length - 2]
    ;[["Revenue", last.revenue, prev.revenue],
      ["Gross Profit", last.grossProfit, prev.grossProfit],
      ["Operating Profit", last.operatingProfit, prev.operatingProfit],
      ["Total Costs", last.costs, prev.costs],
    ].forEach(([name, l, p]) =>
      growthRows.push({ name: String(name), latest: Number(l), prior: Number(p),
        growth: Number(p) ? ((Number(l) - Number(p)) / Math.abs(Number(p))) * 100 : 0 })
    )
  }

  return { records, periods, periodData, accounts, costAccounts, anomalies, growthRows, totalRev }
}
