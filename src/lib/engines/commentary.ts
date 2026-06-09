import type { FPAAnalysis, FPACommentary, FinAnalysis, FinCommentary } from "@/types"
import { fK, fP, fX } from "@/lib/utils/format"

export function buildFPACommentary(analysis: FPAAnalysis): FPACommentary {
  const k = analysis.kpis
  const topFav   = [...analysis.rows].filter(r => r.fav).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 2)
  const topUnfav = [...analysis.rows].filter(r => !r.fav).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 2)
  const rating: FPACommentary["overallRating"] =
    k.ebVar >= 0 ? "Favorable" : k.ebVar >= -k.bEB * 0.05 ? "Mixed" : "Unfavorable"

  return {
    headline: `${rating} quarter — revenue ${k.revVar >= 0 ? "beats" : "misses"} budget by ${fP(Math.abs(k.revVarP))}`,
    overallRating: rating,
    executiveSummary: `Revenue came in ${k.revVar >= 0 ? "above" : "below"} plan at ${fK(k.aRev)} vs budget ${fK(k.bRev)} (${fP(k.revVarP)}). Total costs were ${fK(k.aCost)} vs budget ${fK(k.bCost)} (${fP(k.expVarP)}). EBITDA finished at ${fK(k.aEB)}, a variance of ${fK(k.ebVar)} (${fP(k.ebVarP)}) against plan.`,
    keyDrivers: [
      topFav[0] ? `${topFav[0].Account} outperformed by ${fP(topFav[0].vp)} at ${fK(topFav[0].Actual)} vs budget ${fK(topFav[0].Budget)}` : "Revenue mix broadly in line with plan",
      topFav[1] ? `${topFav[1].Account} delivered a ${fP(Math.abs(topFav[1].vp))} favorable variance of ${fK(Math.abs(topFav[1].v))}` : "Cost lines tracked budget expectations",
      topUnfav[0] ? `${topUnfav[0].Account} overspent at ${fK(topUnfav[0].Actual)} vs budget ${fK(topUnfav[0].Budget)} (${fP(topUnfav[0].vp)})` : "No material unfavorable variances",
    ],
    costAnalysis: `Total costs of ${fK(k.aCost)} were ${k.expVar >= 0 ? "above" : "below"} budget by ${fK(Math.abs(k.expVar))} (${fP(Math.abs(k.expVarP))}). ${topUnfav[0] ? `${topUnfav[0].Account} was the primary driver.` : "Cost performance broadly in line."}`,
    cashFlowObservations: `Monthly average burn stands at ${fK(k.burn)}. ${k.expVarP > 5 ? "Cost trajectory warrants a mid-period reforecast." : "Burn rate is within acceptable parameters."}`,
    risksAndOpportunities: {
      risks: [
        topUnfav[0] ? `Continued overspend in ${topUnfav[0].Account} (${fP(topUnfav[0].vp)}) without revenue offset will compress margins` : "Monitor cost lines for acceleration above budget",
        `Burn rate of ${fK(k.burn)}/mo should be reviewed if cost pressures continue`,
      ],
      opportunities: [
        topFav[0] ? `${topFav[0].Account} momentum (${fP(topFav[0].vp)}) — consider accelerating investment` : "Favorable variances create reinvestment headroom",
        "Procurement and vendor reviews could yield further savings",
      ],
    },
    recommendations: [
      topUnfav[0] ? `Review ${topUnfav[0].Account} spend with department heads to identify savings` : "Review all cost lines above 5% unfavorable variance",
      topFav[0] ? `Build on ${topFav[0].Account} outperformance — assess capacity to accelerate` : "Maintain momentum in outperforming revenue lines",
      "Prepare a full-year reforecast incorporating period actuals and updated assumptions",
    ],
  }
}

export function buildFINCommentary(fin: FinAnalysis): FinCommentary {
  const { periodData: pd, costAccounts, anomalies, totalRev } = fin
  if (!pd.length) return { diagnostic: "No period data found.", marginInsights: [], recommendations: [] }
  const last  = pd[pd.length - 1], first = pd[0]
  const revGrowth = first.revenue ? ((last.revenue - first.revenue) / first.revenue) * 100 : 0
  const gmChg = last.grossMargin - first.grossMargin
  const top   = costAccounts[0], top2 = costAccounts[1]

  return {
    diagnostic: `Revenue has ${revGrowth >= 0 ? "grown" : "declined"} ${fP(Math.abs(revGrowth))} from ${fK(first.revenue)} to ${fK(last.revenue)}. Gross margin is ${gmChg < -1 ? "compressing" : "stable"} at ${fX(last.grossMargin)} (${fP(gmChg)}pp change). Operating margin stands at ${fX(last.opMargin)}. ${top ? `${top.account} is the largest cost driver at ${fX(totalRev ? (top.total / totalRev) * 100 : 0)} of revenue.` : ""}`,
    marginInsights: [
      top && totalRev
        ? { severity: top.total / totalRev > 0.25 ? "high" : "medium", type: top.total / totalRev > 0.25 ? "red" : "amb", text: `${top.account} consumes ${fX((top.total / totalRev) * 100)} of revenue — the single largest cost line.` }
        : { severity: "medium", type: "amb", text: "Review the largest cost lines as a proportion of revenue." },
      gmChg < -2
        ? { severity: "high", type: "red", text: `Gross margin compressed ${fP(Math.abs(gmChg))}pp from ${fX(first.grossMargin)} to ${fX(last.grossMargin)} — costs growing faster than pricing.` }
        : { severity: "positive", type: "grn", text: `Gross margin is holding at ${fX(last.grossMargin)}, indicating stable pricing power.` },
      top2 && totalRev
        ? { severity: "medium", type: "amb", text: `${top2.account} represents ${fX((top2.total / totalRev) * 100)} of revenue. Monitor for proportional scaling.` }
        : { severity: "positive", type: "grn", text: "Secondary cost lines appear well-managed." },
      anomalies.length > 0
        ? { severity: "medium", type: Math.abs(anomalies[0].change) > 40 ? "red" : "amb", text: `${anomalies[0].account} showed a ${fP(Math.abs(anomalies[0].change))} ${anomalies[0].change > 0 ? "increase" : "decrease"} period-over-period.` }
        : { severity: "positive", type: "grn", text: "No significant anomalies. All line items within normal variance ranges." },
    ],
    recommendations: [
      top ? `Review ${top.account} — at ${fX(totalRev ? (top.total / totalRev) * 100 : 0)} of revenue it is the highest-leverage cost opportunity` : "Review top 3 cost lines for efficiency and vendor renegotiation",
      gmChg < -1 ? `Address gross margin compression of ${fP(Math.abs(gmChg))}pp — investigate pricing, supplier costs and product mix` : "Maintain gross margin discipline and monitor for cost inflation",
      `Build a 12-month rolling forecast incorporating the ${fP(revGrowth)} revenue growth trend`,
      anomalies.length > 0 ? `Investigate the ${fP(Math.abs(anomalies[0].change))} movement in ${anomalies[0].account}` : "Implement monthly variance reporting to detect anomalies earlier",
    ],
  }
}
