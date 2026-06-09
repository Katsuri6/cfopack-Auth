"use client"
import { Monitor, TrendingUp } from "lucide-react"
import ModuleCard from "@/components/ui/ModuleCard"
import FeatureCard from "@/components/ui/FeatureCard"

interface HomePageProps { onFPA: () => void; onAnalysis: () => void }

const FEATURES = [
  { emoji: "📊", title: "Variance Analysis", desc: "Budget vs Actuals with absolute & % variances, favorable/unfavorable flags and period summaries.", accent: "acc" },
  { emoji: "📈", title: "Trend Analysis",    desc: "Multi-period revenue, cost and profit trends with period-over-period growth rate calculations.", accent: "pur" },
  { emoji: "🔍", title: "Margin Diagnostics", desc: "Identifies exactly what's compressing your gross, operating and net margins with specific numbers.", accent: "pur" },
  { emoji: "💸", title: "Cost Structure",    desc: "See exactly what percentage of revenue each cost line is consuming, ranked by impact.", accent: "pur" },
  { emoji: "⚡", title: "Anomaly Detection", desc: "Automatically flags unusual spikes, drops and outliers across all line items and periods.", accent: "red" },
  { emoji: "💬", title: "Smart Analyst",     desc: "Ask plain-language questions about your data and get CFO-quality answers instantly.", accent: "acc" },
]

export default function HomePage({ onFPA, onAnalysis }: HomePageProps) {
  return (
    <main className="pt-[62px]">
      {/* Hero */}
      <section
        className="relative min-h-[88vh] flex items-center justify-center text-center overflow-hidden bg-grid-pattern bg-grid"
        style={{ backgroundSize: "44px 44px" }}
      >
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(0,200,240,0.08), transparent 70%)" }} />

        <div className="relative z-10 max-w-[780px] px-5 animate-fade-up">
          <span className="tag-cyan mb-6 inline-flex">✦ Finance Intelligence Platform</span>

          <h1 className="text-[clamp(34px,6.5vw,72px)] font-bold leading-[1.06] tracking-tight mb-5">
            Your Complete<br />
            <span className="text-acc">Finance Intelligence</span><br />
            Platform
          </h1>

          <p className="text-[clamp(14px,2vw,18px)] text-mut leading-relaxed max-w-[540px] mx-auto mb-10">
            Two powerful modules. Upload your data and get boardroom-ready insights,
            smart commentary, charts and actionable recommendations — in minutes.
          </p>

          {/* Module cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[660px] mx-auto mb-10 text-left">
            <ModuleCard
              icon={<Monitor size={22} color="#00C8F0" />}
              iconBg="bg-acc/10 border-acc/20"
              title="FP&A Suite"
              desc="Budget vs Actuals analysis, variance engine, CFO commentary, board packs."
              tags={["Variance", "Commentary", "Board Pack"]}
              tagVariant="cyan"
              hoverBorder="hover:border-acc"
              onClick={onFPA}
            />
            <ModuleCard
              icon={<TrendingUp size={22} color="#9B7FFF" />}
              iconBg="bg-pur/10 border-pur/20"
              title="Financial Analysis"
              desc="Trend analysis, margin diagnostics, cost structure, anomaly detection — no budget needed."
              tags={["Trends", "Margins", "Anomalies"]}
              tagVariant="purple"
              hoverBorder="hover:border-pur"
              onClick={onAnalysis}
            />
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={onFPA} className="btn-cyan px-8 py-3.5 text-[15px]">
              Try FP&amp;A Demo
            </button>
            <button onClick={onAnalysis} className="btn-purple px-8 py-3.5 text-[15px]">
              Try Analysis Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1100px] mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-[clamp(22px,3.5vw,38px)] font-bold mb-3">
            Two modules, one platform
          </h2>
          <p className="text-mut text-sm">
            Whether you have a budget or just actuals — we have you covered.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>
    </main>
  )
}
