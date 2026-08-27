import { useEffect, useState } from "react"
import { ChevronDown, Check } from "lucide-react"

const STAGES = [1200, 1800, 3000]
const rows = ["Reading context", "Searching knowledge", "Composing answer"]

const chevron = Array.from({ length: 9 }, (_, i) => { const r = Math.floor(i / 3), c = i % 3; return (c + Math.abs(r - 1)) * 90 })

function LoaderGrid() {
  return (
    <span aria-hidden className="grid shrink-0 grid-cols-[repeat(3,4px)] gap-[1.5px]">
      {chevron.map((delay, i) => (
        <span key={i} className="size-[4px] rounded-[1px] bg-muted-foreground/60" style={{ opacity: 0.15, animation: `pixel-on 650ms ease-in-out ${delay}ms infinite` }} />
      ))}
    </span>
  )
}

export function Thinking({ onDone }: { onDone?: () => void }) {
  const [stage, setStage] = useState(0)
  const [open, setOpen] = useState(true)
  useEffect(() => {
    if (stage >= STAGES.length) { onDone?.(); return }
    const t = setTimeout(() => setStage(s => s + 1), STAGES[stage])
    return () => clearTimeout(t)
  }, [stage, onDone])
  const working = stage < STAGES.length
  return (
    <div className="w-full">
      <button onClick={() => setOpen(v => !v)} className="flex w-full items-center gap-2 text-left pl-[1px]">
        <span className="flex size-[15px] shrink-0 items-center justify-center">{working ? <LoaderGrid /> : <Check className="size-3.5 text-muted-foreground/60" />}</span>
        {working ? (
          <span className="bg-clip-text text-sm font-medium text-transparent" style={{ backgroundImage: "linear-gradient(90deg, var(--muted-foreground) 35%, var(--foreground) 50%, var(--muted-foreground) 65%)", backgroundSize: "200% 100%", animation: "shimmer-text 1.4s linear infinite" }}>Thinking</span>
        ) : (
          <span className="text-sm font-medium text-muted-foreground">Thought for 6 seconds</span>
        )}
        <ChevronDown className={`ml-auto size-4 text-muted-foreground/60 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="relative mt-2 ml-[7px] border-l border-border/40 pl-5 flex flex-col gap-2 py-1">
          {rows.slice(0, Math.min(stage + 1, rows.length)).map((r, i) => (
            <div key={r} className="flex items-center gap-2 text-xs leading-none text-muted-foreground/70">
              <span className="flex size-3 shrink-0 items-center justify-center">{i < stage ? <Check className="size-3 text-muted-foreground/60" /> : <span className="size-1.5 rounded-full bg-muted-foreground/30" />}</span>
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
