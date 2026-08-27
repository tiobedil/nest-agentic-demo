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

export function Thinking({ onDone, done: forcedDone }: { onDone?: () => void; done?: boolean }) {
  const [stage, setStage] = useState(0)
  const working = forcedDone ? false : stage < STAGES.length
  const [open, setOpen] = useState(!forcedDone)
  useEffect(() => { setOpen(!forcedDone ? true : false) }, [forcedDone])
  useEffect(() => {
    if (forcedDone) return
    if (stage >= STAGES.length) { onDone?.(); return }
    const t = setTimeout(() => setStage(s => s + 1), STAGES[stage])
    return () => clearTimeout(t)
  }, [stage, onDone, forcedDone])
  return (
    <div className="w-full">
      <button onClick={() => setOpen(v => !v)} className="flex w-fit items-center gap-2 text-left pl-[1px]">
        <span className="flex size-[13px] shrink-0 items-center justify-center">{working ? <LoaderGrid /> : <Sparkle className="size-3 fill-muted-foreground/60 text-muted-foreground/60" />}</span>
        <span className={working ? "bg-clip-text text-[12px] font-medium text-transparent" : "text-[12px] font-normal text-muted-foreground"} style={working ? { backgroundImage: "linear-gradient(90deg, color-mix(in oklab, var(--muted-foreground) 35%, transparent) 35%, var(--muted-foreground) 50%, color-mix(in oklab, var(--muted-foreground) 35%, transparent) 65%)", backgroundSize: "200% 100%", animation: "shimmer-text 1.4s linear infinite" } : undefined}>{working ? "Thinking" : "Thought for 4 seconds"}</span>
        <ChevronDown className={`size-4 text-muted-foreground/60 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="relative mt-2 ml-[7px] border-l border-border/20 pl-5 flex flex-col gap-2 py-1">
          {rows.slice(0, forcedDone ? rows.length : Math.min(stage + 1, rows.length)).map((r, i) => (
            <div key={r} className="flex items-center gap-2 text-xs leading-none text-muted-foreground/70">
              <span className="flex size-3 shrink-0 items-center justify-center">{(forcedDone || i < stage) ? <Check className="size-3 text-muted-foreground/60" /> : <LoaderCircle className="size-3 animate-spin text-muted-foreground/60" />}</span>
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
