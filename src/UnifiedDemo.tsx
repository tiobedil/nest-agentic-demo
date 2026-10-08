import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { PromptBar } from "@/components/chat/PromptBar"
import { Thinking } from "@/components/chat/Thinking"
import { StreamingText } from "@/components/chat/StreamingText"
import { OctDemo } from "@/OctDemo"
import { PgAgent2 } from "@/PgAgent2"
import { detectUnifiedFlow } from "@/lib/unified-flow"
import type { UnifiedFlow } from "@/lib/unified-flow"

type Entry = { id: number; prompt: string; flow: UnifiedFlow | null }

const unsupportedSteps = ["Reviewing your request…", "Checking available workflows…", "Looking for a supported action…"]
const unsupportedReplyLines = ["I couldn't find an available workflow for that request.", "Could you rephrase what you'd like me to do?"]

function UnsupportedReply({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [thought, setThought] = useState(false)
  const [firstLineDone, setFirstLineDone] = useState(false)
  const finishFirstLine = useCallback(() => setFirstLineDone(true), [])

  useEffect(() => {
    const timers = unsupportedSteps.map((_, index) => window.setTimeout(() => {
      setProgress(index + 1)
      if (index === unsupportedSteps.length - 1) setThought(true)
    }, (index + 1) * 1100))
    return () => timers.forEach(window.clearTimeout)
  }, [])

  return <div className="flex flex-col gap-3">
    <Thinking title="Thinking" completedTitle="Checked available workflows" steps={unsupportedSteps} completed={progress} done={thought} />
    {thought && <div>
      <StreamingText text={unsupportedReplyLines[0]} speed={100} autoScroll={false} onDone={finishFirstLine} />
      {firstLineDone && <StreamingText text={unsupportedReplyLines[1]} speed={100} autoScroll={false} onDone={onDone} />}
    </div>}
  </div>
}

function FlowEntry({ entry, panelContainer, active, onBusyChange, onPanelOpenChange }: {
  entry: Entry
  panelContainer: HTMLElement | null
  active: boolean
  onBusyChange: (id: number, busy: boolean) => void
  onPanelOpenChange: (id: number, open: boolean) => void
}) {
  const reportBusy = useCallback((busy: boolean) => onBusyChange(entry.id, busy), [entry.id, onBusyChange])
  const reportPanel = useCallback((open: boolean) => onPanelOpenChange(entry.id, open), [entry.id, onPanelOpenChange])
  const finishReply = useCallback(() => reportBusy(false), [reportBusy])
  if (entry.flow === "extension") return <PgAgent2 embedded initialPrompt={entry.prompt} onBusyChange={reportBusy} />
  if (entry.flow === "inspection") return <OctDemo embedded initialPrompt={entry.prompt} onBusyChange={reportBusy} onPanelOpenChange={reportPanel} panelContainer={panelContainer} showPanel={active} scheduleId={`building-schedule-${entry.id}`} />
  return <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 text-sm">
    <div className="max-w-[78%] self-end rounded-2xl rounded-br-[6px] bg-violet-100 px-4 py-2.5 text-violet-950">{entry.prompt}</div>
    <UnsupportedReply onDone={finishReply} />
  </div>
}

export function UnifiedDemo() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [busyEntries, setBusyEntries] = useState<Record<number, boolean>>({})
  const [openPanels, setOpenPanels] = useState<Record<number, boolean>>({})
  const [panelContainer, setPanelContainer] = useState<HTMLDivElement | null>(null)
  const nextId = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isThinking = Object.values(busyEntries).some(Boolean)
  const panelOpen = activeId !== null && Boolean(openPanels[activeId])
  const hasChat = entries.length > 0
  const reportBusy = useCallback((id: number, busy: boolean) => {
    setBusyEntries(current => current[id] === busy ? current : { ...current, [id]: busy })
  }, [])
  const reportPanel = useCallback((id: number, open: boolean) => {
    setOpenPanels(current => current[id] === open ? current : { ...current, [id]: open })
  }, [])
  const send = (prompt: string) => {
    if (isThinking || !prompt.trim()) return
    const entry = { id: ++nextId.current, prompt: prompt.trim(), flow: detectUnifiedFlow(prompt) }
    setEntries(current => [...current, entry])
    setActiveId(entry.id)
    reportBusy(entry.id, true)
  }

  useLayoutEffect(() => {
    const viewport = scrollRef.current
    if (!viewport || !hasChat) return
    let frame: number | null = null
    const follow = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "auto" })
      })
    }
    follow()
    if (!isThinking) return () => { if (frame !== null) window.cancelAnimationFrame(frame) }
    const changes = new MutationObserver(follow)
    const resize = new ResizeObserver(follow)
    changes.observe(viewport, { childList: true, subtree: true, characterData: true, attributes: true })
    resize.observe(viewport)
    return () => {
      changes.disconnect()
      resize.disconnect()
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [entries.length, hasChat, isThinking])

  return <main className="unified-demo oct-demo flex h-full min-w-0 flex-col overflow-hidden bg-background font-sans lg:flex-row">
    <section aria-label="Unified conversation" className={`flex min-h-0 min-w-0 flex-1 flex-col ${panelOpen ? "max-lg:basis-1/2" : ""}`}>
      <div ref={scrollRef} data-unified-chat-scroll className="flex-1 overflow-y-auto bg-white">
        {!hasChat ? <div className="flex min-h-full items-start justify-center p-6 pt-12 md:pt-[240px]">
          <div className="flex w-full max-w-2xl flex-col items-center gap-8">
            <div className="space-y-4 text-center">
              <h1 className="text-[36px] font-semibold leading-none tracking-tight text-foreground/80">What would you like to get done?</h1>
              <p className="text-sm leading-6 text-muted-foreground">Ask me to help plan, coordinate or manage an operational task.</p>
            </div>
            <PromptBar onSend={send} isThinking={isThinking} placeholder="Ask anything..." />
          </div>
        </div> : <div className="flex flex-col gap-8 py-8" role="log" aria-label="Unified Demo conversation">
          <h1 className="sr-only">Unified Demo</h1>
          {entries.map(entry => <div key={entry.id} data-unified-flow={entry.flow ?? "unmatched"} onPointerDown={() => { if (!isThinking) setActiveId(entry.id) }} onFocusCapture={() => { if (!isThinking) setActiveId(entry.id) }}>
            <FlowEntry entry={entry} active={entry.id === activeId} panelContainer={panelContainer} onBusyChange={reportBusy} onPanelOpenChange={reportPanel} />
          </div>)}
        </div>}
      </div>
      {hasChat && <div className="flex shrink-0 justify-center px-4 pb-6"><PromptBar onSend={send} isThinking={isThinking} placeholder="Ask anything..." /></div>}
    </section>
    <div ref={setPanelContainer} hidden={!panelOpen} className={panelOpen ? "min-h-0 min-w-0 max-lg:flex-1 lg:w-[42%] lg:min-w-[440px] lg:max-w-[720px] lg:shrink-0" : "hidden"} />
  </main>
}
