import { useEffect, useLayoutEffect, useState } from "react"
import { ChevronDown, Check, Sparkle, LoaderCircle } from "lucide-react"

const STAGES = [1000, 1600, 1800, 1200]
const rows = ["Finding Amar's reservation", "Checking availability", "Checking price", "Composing date proposal"]
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

export function Processing({ onDone, done: forcedDone, title, hideSteps, stages = STAGES, doneTitle, completedTitle = "Processed request", steps = rows, completed, disabled = false }: { onDone?: () => void; done?: boolean; title?: string; hideSteps?: boolean; stages?: number[]; doneTitle?: string; completedTitle?: string; steps?: string[]; completed?: number; disabled?: boolean }) {
  const [stage, setStage] = useState(0)
  const controlled = completed !== undefined
  const activeStage = completed ?? stage
  const working = !forcedDone && activeStage < (controlled ? steps.length : stages.length)
  const [startedAt] = useState(() => performance.now())
  const [duration, setDuration] = useState(0)
  useLayoutEffect(() => {
    if (!working) setDuration(Math.max(0.1, Math.round((performance.now() - startedAt) / 100) / 10))
  }, [working, startedAt])
  const completionText = doneTitle ?? `${completedTitle} in ${duration} ${duration === 1 ? "second" : "seconds"}`
  const [open, setOpen] = useState(!forcedDone)
  useEffect(() => { setOpen(!forcedDone ? true : false) }, [forcedDone])
  useEffect(() => {
    if (forcedDone || controlled) return
    if (stage >= stages.length) { onDone?.(); return }
    const t = setTimeout(() => setStage(s => s + 1), stages[stage])
    return () => clearTimeout(t)
  }, [stage, onDone, forcedDone, stages, controlled])
  return (
    <div className="w-full font-sans" data-thinking data-thinking-progress={forcedDone ? steps.length : activeStage} data-thinking-total={steps.length}>
      <button type="button" disabled={disabled} aria-expanded={!hideSteps && open} onClick={() => setOpen(v => !v)} className="flex w-fit items-center gap-2 rounded text-left pl-[1px] focus-visible:outline-2 focus-visible:outline-violet-600">
        <span className="flex size-[13px] shrink-0 items-center justify-center">{working ? <LoaderGrid /> : <Sparkle className="size-3 text-muted-foreground/60" fill="none" />}</span>
        <span className={working ? "bg-clip-text text-[12px] font-medium text-transparent" : "text-[12px] font-normal text-muted-foreground"} style={working ? { backgroundImage: "linear-gradient(90deg, color-mix(in oklab, var(--muted-foreground) 35%, transparent) 35%, var(--muted-foreground) 50%, color-mix(in oklab, var(--muted-foreground) 35%, transparent) 65%)", backgroundSize: "200% 100%", animation: "shimmer-text 1.4s linear infinite" } : undefined}>{working ? (title ?? "Processing") : completionText}</span>
        {!hideSteps && <ChevronDown className={`size-4 text-muted-foreground/60 transition ${open ? "rotate-180" : ""}`} />}
      </button>
      {!hideSteps && open && (
        <div className="relative mt-2 ml-[7px] border-l border-border/20 pl-5 flex flex-col gap-2 py-1">
          {steps.slice(0, forcedDone ? steps.length : Math.min(activeStage + 1, steps.length)).map((r, i) => (
            <div key={r} data-thinking-step={i} data-thinking-state={forcedDone || i < activeStage ? "complete" : "current"} className="flex items-center gap-2 text-xs leading-none text-muted-foreground/70">
              <span className="flex size-3 shrink-0 items-center justify-center">{(forcedDone || i < activeStage) ? <Check aria-label="Completed" className="size-3 text-muted-foreground/60" /> : <LoaderCircle aria-label="In progress" className="size-3 motion-safe:animate-spin text-muted-foreground/60" />}</span>
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
