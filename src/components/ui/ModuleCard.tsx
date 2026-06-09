"use client"
import { useState } from "react"

interface ModuleCardProps {
  icon: React.ReactNode; iconBg: string; title: string; desc: string
  tags: string[]; tagVariant: "cyan" | "purple"; hoverBorder: string; onClick: () => void
}
export default function ModuleCard({ icon, iconBg, title, desc, tags, tagVariant, hoverBorder, onClick }: ModuleCardProps) {
  const [hovered, setHovered] = useState(false)
  const tagClass = tagVariant === "cyan" ? "tag-cyan" : "tag-purple"
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`card p-6 cursor-pointer transition-all duration-300 ${hovered ? hoverBorder + " -translate-y-1" : ""}`}
    >
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${iconBg}`}>
        {icon}
      </div>
      <div className="font-bold text-[14px] mb-2">{title}</div>
      <p className="text-mut text-[13px] leading-relaxed mb-3">{desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => <span key={t} className={tagClass} style={{ fontSize: 9 }}>{t}</span>)}
      </div>
    </div>
  )
}
