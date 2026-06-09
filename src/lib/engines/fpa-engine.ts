import type { FPAAnalysis, FPARow, FPAMonthly, FPAKPIs } from "@/types"

type RawRow = Record<string, string | number | null>

function findKey(row: RawRow, ...candidates: string[]): string {
  const keys = Object.keys(row)
  for (const c of candidates) {
    const found = keys.find(k => k.toLowerCase().includes(c.toLowerCase()))
    if (found) return found
  }
  return candidates[0]
}

export function calcFPA(raw: RawRow[]): FPAAnalysis {
  if (!raw.length) throw new Error("No data rows found")

  const first = raw[0]
  const deptKey  = findKey(first, "department", "dept", "category")
  const acctKey  = findKey(first, "account", "description", "name")
  const budgKey  = findKey(first, "budget", "budgeted", "plan")
  const actKey   = findKey(first, "actual", "actuals")
  const monthKey = findKey(first, "month", "period")

  const data = raw
    .map(r => ({
      Department: String(r[deptKey] || "Other"),
      Account:    String(r[acctKey] || "Unknown"),
      Budget:     Number(r[budgKey] || 0),
      Actual:     Number(r[actKey]  || 0),
      Month:      String(r[monthKey] || "?"),
    }))
    .filter(r => r.Budget !== 0 || r.Actual !== 0)

  const rows: FPARow[] = data.map(r => {
    const v  = r.Actual - r.Budget
    const vp = r.Budget ? (v / Math.abs(r.Budget)) * 100 : 0
    const isRev = r.Department.toLowerCase().includes("revenue") ||
                  r.Department.toLowerCase().includes("income") ||
                  r.Department.toLowerCase().includes("sales")
    return { ...r, v, vp, fav: isRev ? r.Actual >= r.Budget : r.Actual <= r.Budget }
  })

  const months = [...new Set(data.map(r => r.Month))]

  const monthly: FPAMonthly[] = months.map(m => {
    const mr = rows.filter(r => r.Month === m)
    const isRev = (r: FPARow) => r.Department.toLowerCase().includes("revenue") || r.Department.toLowerCase().includes("income")
    const bR = mr.filter(isRev).reduce((s, r) => s + r.Budget, 0)
    const aR = mr.filter(isRev).reduce((s, r) => s + r.Actual, 0)
    const bC = mr.filter(r => !isRev(r)).reduce((s, r) => s + r.Budget, 0)
    const aC = mr.filter(r => !isRev(r)).reduce((s, r) => s + r.Actual, 0)
    return { Month: m, bRev: bR, aRev: aR, bEB: bR - bC, aEB: aR - aC }
  })

  const isRevRow = (r: FPARow) =>
    r.Department.toLowerCase().includes("revenue") ||
    r.Department.toLowerCase().includes("income") ||
    r.Department.toLowerCase().includes("sales")
  const rev  = rows.filter(isRevRow)
  const cost = rows.filter(r => !isRevRow(r))
  const bR   = rev.reduce((s, r)  => s + r.Budget, 0)
  const aR   = rev.reduce((s, r)  => s + r.Actual, 0)
  const bC   = cost.reduce((s, r) => s + r.Budget, 0)
  const aC   = cost.reduce((s, r) => s + r.Actual, 0)

  const expByDept: Record<string, number> = {}
  cost.forEach(r => { expByDept[r.Department] = (expByDept[r.Department] || 0) + r.Actual })

  const kpis: FPAKPIs = {
    bRev: bR, aRev: aR, bCost: bC, aCost: aC, bEB: bR - bC, aEB: aR - aC,
    revVar:  aR - bR, revVarP:  bR ? ((aR - bR) / bR) * 100 : 0,
    expVar:  aC - bC, expVarP:  bC ? ((aC - bC) / bC) * 100 : 0,
    ebVar: (aR - aC) - (bR - bC),
    ebVarP: (bR - bC) ? ((aR - aC - (bR - bC)) / Math.abs(bR - bC)) * 100 : 0,
    burn: months.length ? aC / months.length : 0,
  }

  return { rows, monthly, months, expByDept, kpis }
}
