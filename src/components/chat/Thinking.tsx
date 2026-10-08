import { useEffect, useState } from "react"
import { ChevronDown, Check, Sparkle, LoaderCircle } from "lucide-react"

const STAGES = [1000, 1600, 1800]
const rows = ["Reading context", "Searching knowledge", "Composing answer"]
const chevron = Array.from({ length: 9 }, (_, i) => { const r = Math.floor(i / 3), c = i % 3; return (c + Math.abs(r - 1)) * 90 })

function LoaderGrid() {
  return (
    <span aria-hidden className="grid shrink-0 grid-cols-[repeat(3,3px)] gap-[1px]">
      {chevron.map((delay, i) => (
        <span key={i} className="size-[3px] rounded-[1px] bg-muted-foreground/60" style={{ opacity: 0.15, animation: `pixel-on 650ms ease-in-out ${delay}ms infinite` }} />
      ))}
    </span>
  )
}

export function Thinking({ onDone, done: forcedDone, steps, completed, title, disabled = false }: { onDone?: () => void; done?: boolean; steps?: string[]; completed?: number; title?: string; disabled?: boolean }) {
  const [stage, setStage] = useState(0)
  const controlled = completed !== undefined
  const activeStage = controlled ? completed : stage
  const labels = steps ?? rows
  const working = controlled ? activeStage < labels.length : !forcedDone && stage < STAGES.length
  const [open, setOpen] = useState(!forcedDone)
  useEffect(() => { setOpen(!forcedDone ? true : false) }, [forcedDone])
  useEffect(() => {
    if (forcedDone || controlled) return
    if (stage >= STAGES.length) { onDone?.(); return }
    const t = setTimeout(() => setStage(s => s + 1), STAGES[stage])
    return () => clearTimeout(t)
  }, [stage, onDone, forcedDone, controlled])
  return (
    <div className="w-full" data-thinking data-thinking-progress={forcedDone ? labels.length : activeStage} data-thinking-total={labels.length}>
      <button type="button" disabled={disabled} aria-expanded={open} onClick={() => setOpen(v => !v)} className="flex w-fit items-center gap-2 rounded text-left pl-[1px] focus-visible:outline-2 focus-visible:outline-violet-600">
        <span className="flex size-[13px] shrink-0 items-center justify-center">{working ? <LoaderGrid /> : <Sparkle className="size-3 text-muted-foreground/60" fill="none" />}</span>
        <span className={controlled ? "text-xs font-medium text-slate-700" : working ? "bg-clip-text text-[12px] font-medium text-transparent" : "text-[12px] font-normal text-muted-foreground"} style={working && !controlled ? { backgroundImage: "linear-gradient(90deg, color-mix(in oklab, var(--muted-foreground) 35%, transparent) 35%, var(--muted-foreground) 50%, color-mix(in oklab, var(--muted-foreground) 35%, transparent) 65%)", backgroundSize: "200% 100%", animation: "shimmer-text 1.4s linear infinite" } : undefined}>{title ?? (working ? "Thinking" : "Thought for 4 seconds")}</span>
        <ChevronDown className={`size-4 text-muted-foreground/60 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="relative mt-2 ml-[7px] border-l border-border/20 pl-5 flex flex-col gap-2 py-1">
          {labels.slice(0, forcedDone ? labels.length : Math.min(activeStage + 1, labels.length)).map((r, i) => (
            <div key={r} data-thinking-step={i} data-thinking-state={forcedDone || i < activeStage ? "complete" : "current"} className={`flex items-center gap-2 text-xs leading-5 ${controlled ? "text-slate-600" : "text-muted-foreground/70"}`}>
              <span className="flex size-3 shrink-0 items-center justify-center">{(forcedDone || i < activeStage) ? <Check aria-label="Completed" className="size-3 text-slate-600" /> : i === activeStage ? <LoaderCircle aria-label="In progress" className="size-3 motion-safe:animate-spin text-slate-600" /> : <span aria-label="Pending" className="size-2 rounded-full bg-slate-300" />}</span>
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
