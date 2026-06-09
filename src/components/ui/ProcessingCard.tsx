import Spinner from "./Spinner"
interface ProcessingCardProps { steps: string[]; currentStep: number; description?: string; color?: string }
export default function ProcessingCard({ steps, currentStep, description, color = "#00C8F0" }: ProcessingCardProps) {
  return (
    <div className="card p-10 flex flex-col items-center text-center gap-6">
      <Spinner size={54} color={color} />
      <div>
        <p className="font-semibold text-[15px] mb-2">{steps[currentStep] || "Processing..."}</p>
        {description && <p className="text-mut text-sm">{description}</p>}
      </div>
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div key={i} style={{ transition: "background 0.3s" }}
               className={`w-2 h-2 rounded-full ${i <= currentStep ? "" : "bg-bdr"}`}
               style={{ background: i <= currentStep ? color : "#1C2E45" }} />
        ))}
      </div>
    </div>
  )
}
