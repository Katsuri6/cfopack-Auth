"use client"
import { useState } from "react"
interface FeatureCardProps { emoji: string; title: string; desc: string; accent: string }
export default function FeatureCard({ emoji, title, desc, accent }: FeatureCardProps) {
  const [hovered, setHovered] = useState(false)
  const hoverColors: Record<string, string> = { acc: "hover:border-acc", pur: "hover:border-pur", red: "hover:border-red" }
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
         className={`card p-5 transition-all duration-300 ${hoverColors[accent] || ""}`}>
      <div className="text-[22px] mb-3">{emoji}</div>
      <div className="font-semibold text-[13px] mb-2">{title}</div>
      <p className="text-mut text-[12px] leading-relaxed">{desc}</p>
    </div>
  )
}
