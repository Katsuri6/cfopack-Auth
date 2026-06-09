"use client"
interface CheckboxProps { checked: boolean; onToggle: () => void; label: string; sublabel: string; color?: "cyan" | "purple" }
export default function Checkbox({ checked, onToggle, label, sublabel, color = "cyan" }: CheckboxProps) {
  const bg     = color === "purple" ? (checked ? "bg-pur border-pur" : "border-bdr") : (checked ? "bg-acc border-acc" : "border-bdr")
  return (
    <div onClick={onToggle}
         className="card flex items-center gap-3 p-4 cursor-pointer transition-colors hover:border-acc/40">
      <div className={`w-[17px] h-[17px] rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${bg}`}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color === "purple" ? "#fff" : "#000"} strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-mut text-xs">{sublabel}</p>
      </div>
    </div>
  )
}
