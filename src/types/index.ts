// ─── FP&A ─────────────────────────────────────────────────────────────────
export interface FPARow {
  Department: string
  Account: string
  Budget: number
  Actual: number
  Month: string
  v: number        // variance
  vp: number       // variance %
  fav: boolean     // favorable?
}

export interface FPAMonthly {
  Month: string
  bRev: number
  aRev: number
  bEB:  number
  aEB:  number
}

export interface FPAKPIs {
  bRev: number; aRev: number
  bCost: number; aCost: number
  bEB: number;  aEB: number
  revVar: number; revVarP: number
  expVar: number; expVarP: number
  ebVar: number;  ebVarP: number
  burn: number
}

export interface FPAAnalysis {
  rows:       FPARow[]
  monthly:    FPAMonthly[]
  months:     string[]
  expByDept:  Record<string, number>
  kpis:       FPAKPIs
}

export interface FPACommentary {
  headline:            string
  overallRating:       'Favorable' | 'Unfavorable' | 'Mixed'
  executiveSummary:    string
  keyDrivers:          string[]
  costAnalysis:        string
  cashFlowObservations:string
  risksAndOpportunities: { risks: string[]; opportunities: string[] }
  recommendations:     string[]
}

// ─── Financial Analysis ────────────────────────────────────────────────────
export interface FinRecord {
  account:  string
  category: string
  period:   string
  amount:   number
}

export interface FinPeriodData {
  period:           string
  revenue:          number
  costs:            number
  cogs:             number
  grossProfit:      number
  operatingProfit:  number
  grossMargin:      number
  opMargin:         number
}

export interface FinAccount {
  account:  string
  category: string
  total:    number
  byPeriod: Record<string, number>
}

export interface FinAnomaly {
  account:  string
  category: string
  change:   number
  latest:   number
  prev:     number
}

export interface FinGrowthRow {
  name:   string
  latest: number
  prior:  number
  growth: number
}

export interface FinAnalysis {
  records:      FinRecord[]
  periods:      string[]
  periodData:   FinPeriodData[]
  accounts:     FinAccount[]
  costAccounts: FinAccount[]
  anomalies:    FinAnomaly[]
  growthRows:   FinGrowthRow[]
  totalRev:     number
}

export interface MarginInsight {
  severity: 'high' | 'medium' | 'positive'
  type:     'red' | 'amb' | 'grn'
  text:     string
}

export interface FinCommentary {
  headline?:      string
  diagnostic:     string
  marginInsights: MarginInsight[]
  recommendations: string[]
}

// ─── App state ─────────────────────────────────────────────────────────────
export type AppPage = 'home' | 'fpa-upload' | 'fin-upload' | 'fpa-report' | 'fin-report'

export interface AppState {
  currentPage:  AppPage
  fpaResult:    { analysis: FPAAnalysis; commentary: FPACommentary } | null
  finResult:    { analysis: FinAnalysis; commentary: FinCommentary } | null
  chatHistory:  { role: 'user' | 'assistant'; content: string }[]
  chatMode:     'fpa' | 'fin'
}
