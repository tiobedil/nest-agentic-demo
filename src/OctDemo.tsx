import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { PromptBar } from "@/components/chat/PromptBar"
import { StreamingText } from "@/components/chat/StreamingText"
import { Thinking } from "@/components/chat/Thinking"
import { FullSchedule, InspectionAction, LoadingSurface, OperationSuccess, PlanSummary, ResidentAdjustment, ResidentCard, RouteCard } from "@/components/inspection/InspectionCards"
import type { RouteState } from "@/lib/inspection-plan"

type Phase = "planning" | "routing" | "review" | "execution"
type Mode = "intro" | "processing" | "loading" | "ready" | "route-original" | "route-applied" | "route-settling" | "route-optimised" | "route-done"
type AssistantMessage = { id: number; role: "assistant"; phase: Phase; adjusted: boolean }
type Message = AssistantMessage | { id: number; role: "user"; text: string }
type PanelState = { state: RouteState; loading: boolean; reviewable: boolean; confirmed: boolean }
type Decision = "recommended" | "standard" | "confirm"

const planSteps = ["Checking inspection scope…", "Assigning technicians…", "Building tentative schedules…", "Checking resident access history…", "Generating UI"]
const optimiseSteps = ["Locking Amar’s 5:45 PM access window…", "Checking remaining resident constraints…", "Regrouping inspections by floor…", "Optimising technician route…"]
const executeSteps = ["Publishing technician schedules…", "Confirming appointment windows…", "Applying resident access requirements…", "Updating building operations…", "Sending resident notifications…"]
const reviewSteps = ["Generating UI"]
const openingText = "I’ll schedule the annual in-unit fire-safety inspections for all 116 apartments in Tower C on Tuesday, 13 October, and check resident access history before confirming the plan."
const routeCompletionText = "Amar’s 5:45 PM access window is preserved, while the remaining inspections have been regrouped into continuous floor blocks."

function AssistantReply({ message, active, onReady, onDecision, onReview, onPanelChange }: {
  onPanelChange: (id: number, update: Partial<PanelState>) => void
  message: AssistantMessage
  active: boolean
  onReady: (id: number) => void
  onDecision: (id: number, decision: Decision, adjusted: boolean) => void
  onReview: (id: number) => void
}) {
  const { id, phase, adjusted } = message
  const [mode, setMode] = useState<Mode>("intro")
  const [traceProgress, setTraceProgress] = useState(0)
  const residentRef = useRef<HTMLDivElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const steps = phase === "planning" ? planSteps : phase === "routing" ? optimiseSteps : phase === "review" ? reviewSteps : executeSteps
  const loading = mode === "loading" && traceProgress === steps.length
  const disabled = !active || mode !== "ready"
  const intro = phase === "planning" ? openingText
    : phase === "routing" ? "I’ll move Amar to 5:45 PM and put Unit 205 into the released 4:30 PM slot. His new access window affects Technician 4’s route, so I’ll regroup the remaining inspections by floor while preserving his approved appointment."
    : phase === "review" ? adjusted ? "The Tower C inspection plan is ready for your approval. Amar’s 5:45 PM resident-present appointment is preserved and all six routes are optimised. No appointments have been communicated yet."
      : "I’ll keep Amar’s standard 4:30 PM appointment as requested. His higher failed-access risk remains. Review the building-level plan before confirming and notifying residents."
    : "I’ll publish the approved technician schedules, confirm all 116 appointment windows, apply resident access requirements, and notify residents."
  const introDone = useCallback(() => setMode("processing"), [])
  const routeDone = useCallback(() => setMode("route-done"), [])

  useEffect(() => {
    if (!active || mode !== "processing") return
    const timers = steps.map((_, index) => window.setTimeout(() => setTraceProgress(index + 1), (index + 1) * 850))
    timers.push(window.setTimeout(() => {
      setMode("loading")
    }, steps.length * 850 + 450))
    return () => timers.forEach(window.clearTimeout)
  }, [active, mode, phase, steps])

  useEffect(() => {
    if (!active) return
    const delay = mode === "route-original" ? 850 : mode === "route-applied" ? 1800 : mode === "route-settling" ? 1400 : mode === "loading" ? 700 : mode === "route-done" ? 1600 : null
    if (delay === null) return
    const timer = window.setTimeout(() => {
      if (mode === "route-original") { onPanelChange(id, { state: "exception" }); setMode("route-applied") }
      if (mode === "route-applied") { onPanelChange(id, { state: "optimised" }); setMode("route-settling") }
      if (mode === "loading") setMode(phase === "routing" ? "route-original" : "ready")
      if (mode === "route-settling") setMode("route-optimised")
      if (mode === "route-done") onReview(id)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [active, mode, id, onReview, phase, onPanelChange])

  useLayoutEffect(() => {
    if (!active) return
    if (phase === "planning" && (loading || mode === "ready")) onPanelChange(id, { state: "original", loading, reviewable: false, confirmed: false })
    if (phase === "review" && mode === "ready") onPanelChange(id, { reviewable: true })
    if (phase === "execution" && mode === "ready") onPanelChange(id, { confirmed: true })
  }, [active, phase, loading, mode, id, onPanelChange])

  useLayoutEffect(() => {
    if (!active || mode !== "ready") return
    onReady(id)
    if (phase === "planning") {
      summaryRef.current?.scrollIntoView({ block: "start", behavior: "auto" })
      summaryRef.current?.focus({ preventScroll: true })
    }
  }, [active, mode, id, onReady, phase])

  const reviewResident = () => {
    if (disabled) return
    residentRef.current?.scrollIntoView({ block: "center" })
    residentRef.current?.focus({ preventScroll: true })
  }
  const planningCards = <>
    <div data-plan-summary ref={mode === "ready" ? summaryRef : undefined} tabIndex={mode === "ready" && active ? -1 : undefined} className="rounded-lg focus-visible:outline-2 focus-visible:outline-violet-600">
      <PlanSummary approved={false} adjusted={false} routesOptimised={false} onReview={reviewResident} disabled={disabled} />
    </div>
    <div data-resident-review ref={mode === "ready" ? residentRef : undefined} tabIndex={mode === "ready" && active ? -1 : undefined} className="rounded-lg focus-visible:outline-2 focus-visible:outline-violet-600">
      <ResidentCard disabled={disabled} onApply={() => onDecision(id, "recommended", true)} onKeep={() => onDecision(id, "standard", false)} />
    </div>
  </>
  const reviewCards = <>
    <PlanSummary approved adjusted={adjusted} routesOptimised onReview={reviewResident} disabled={disabled} />
    <ResidentAdjustment adjusted={adjusted} />
    <InspectionAction disabled={disabled} onClick={() => onDecision(id, "confirm", adjusted)}>Confirm &amp; notify residents<ArrowRight aria-hidden="true" className="size-4" /></InspectionAction>
    <p className="text-center text-xs leading-5 text-slate-500">The plan remains tentative until you confirm. No residents have been notified.</p>
  </>
  const traceTitle = phase === "planning" ? "Planning Tower C inspections" : phase === "routing" ? "Automatically optimising technician route" : phase === "review" ? "Preparing inspection plan" : "Confirming and notifying residents"
  const showTrace = mode !== "intro"

  return <div data-assistant-message={id} data-phase={phase} data-mode={mode} className="flex flex-col gap-4">
    <StreamingText text={intro} speed={100} onDone={introDone} autoScroll={false} />
    {showTrace && <Thinking title={traceTitle} steps={steps} completed={traceProgress} disabled={!active} />}
    {phase === "planning" && loading && <LoadingSurface label="Loading tentative plan, resident review and technician route">{planningCards}</LoadingSurface>}
    {phase === "planning" && mode === "ready" && planningCards}
    {phase === "routing" && (mode === "route-optimised" || mode === "route-done") && <>
      <div data-route-success className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold leading-5 text-emerald-800"><CheckCircle2 aria-hidden="true" className="size-4 shrink-0" /><span>Route optimised</span></div>
      <StreamingText text={routeCompletionText} speed={100} onDone={routeDone} autoScroll={false} />
      <p className="text-xs text-slate-600">✓ No unnecessary floor changes</p><p className="text-xs text-slate-600">✓ No other resident constraints affected</p>
    </>}
    {phase === "review" && loading && <LoadingSurface label="Loading building-level approval plan">{reviewCards}</LoadingSurface>}
    {phase === "review" && mode === "ready" && reviewCards}
    {phase === "execution" && loading && <LoadingSurface label="Loading inspection operation result"><OperationSuccess adjusted={adjusted} /></LoadingSurface>}
    {phase === "execution" && mode === "ready" && <OperationSuccess adjusted={adjusted} />}
  </div>
}

export function OctDemo() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [panel, setPanel] = useState<PanelState | null>(null)
  const [showFullSchedule, setShowFullSchedule] = useState(false)
  const panelOpen = panel !== null
  const nextId = useRef(0)
  const activeRef = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const appendReply = useCallback((phase: Phase, adjusted: boolean, userText?: string) => {
    const additions: Message[] = []
    if (phase === "planning") setShowFullSchedule(false)
    if (userText) additions.push({ id: ++nextId.current, role: "user", text: userText })
    const id = ++nextId.current
    additions.push({ id, role: "assistant", phase, adjusted })
    activeRef.current = id
    setActiveId(id)
    setIsThinking(true)
    setMessages(current => [...current, ...additions])
  }, [])
  const onPanelChange = useCallback((id: number, update: Partial<PanelState>) => {
    if (activeRef.current !== id) return
    setPanel(current => ({ state: "original", loading: false, reviewable: false, confirmed: false, ...current, ...update }))
  }, [])
  const onReady = useCallback((id: number) => { if (activeRef.current === id) setIsThinking(false) }, [])
  const onDecision = useCallback((id: number, decision: Decision, adjusted: boolean) => {
    if (activeRef.current !== id) return
    if (decision === "recommended") appendReply("routing", true, "Use 5:45 PM")
    if (decision === "standard") appendReply("review", false, "Keep 4:30 PM")
    if (decision === "confirm") appendReply("execution", adjusted, "Confirm & notify residents")
  }, [appendReply])
  const onReview = useCallback((id: number) => { if (activeRef.current === id) appendReply("review", true) }, [appendReply])
  const send = (text: string) => { if (!isThinking && text.trim()) appendReply("planning", true, text.trim()) }
  useLayoutEffect(() => {
    const viewport = scrollRef.current
    const incoming = viewport?.querySelector<HTMLElement>(`[data-assistant-message="${activeId}"]`)
    if (!viewport || !incoming || !isThinking) return
    let frame: number | null = null
    const followIncoming = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "auto" })
      })
    }
    const resize = new ResizeObserver(followIncoming)
    const changes = new MutationObserver(followIncoming)
    resize.observe(incoming)
    resize.observe(viewport)
    changes.observe(incoming, { childList: true, subtree: true, characterData: true })
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "auto" })
    return () => {
      resize.disconnect()
      changes.disconnect()
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [activeId, isThinking])

  return <main className="oct-demo flex h-full min-w-0 flex-col bg-background font-sans lg:flex-row">
    <section aria-label="Conversation" className={`flex min-h-0 min-w-0 flex-1 flex-col ${panelOpen ? "max-lg:basis-1/2" : ""}`}>
    <div ref={scrollRef} data-chat-scroll className="flex-1 overflow-y-auto bg-white">
      {messages.length === 0 ? <div className="flex min-h-full items-start justify-center bg-white p-6 pt-12 md:pt-[240px]">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
          <div className="space-y-4 text-center">
            <h1 className="text-[36px] font-semibold leading-none tracking-tight text-foreground/80">How can I help you today?</h1>
            <p className="text-sm text-muted-foreground">Start a conversation. The assistant replies with the same message for now.</p>
          </div>
          <PromptBar onSend={send} isThinking={isThinking} />
        </div>
      </div> : <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8" role="log" aria-label="Inspection planning conversation">
        <h1 className="sr-only">Inspection planning conversation</h1>
        {messages.map(message => message.role === "user"
          ? <div key={message.id} className="max-w-[78%] self-end rounded-2xl rounded-br-[6px] bg-violet-100 px-4 py-2.5 text-sm text-violet-950">{message.text}</div>
          : <AssistantReply key={message.id} message={message} active={activeId === message.id} onReady={onReady} onDecision={onDecision} onReview={onReview} onPanelChange={onPanelChange} />)}
      </div>}
    </div>
    {messages.length > 0 && <div className="flex shrink-0 justify-center px-4 pb-6"><PromptBar onSend={send} isThinking={isThinking} /></div>}
    </section>
    <aside aria-label="Inspection plan review" hidden={!panelOpen} className={panelOpen ? "min-h-0 min-w-0 overflow-y-auto border-t border-slate-200 bg-slate-50 p-4 max-lg:flex-1 lg:w-[34%] lg:min-w-[380px] lg:max-w-[560px] lg:shrink-0 lg:border-t-0 lg:border-l lg:p-5" : "hidden"}>
      {panel && <div className="flex min-w-0 flex-col gap-4">
        {panel.loading ? <LoadingSurface label="Loading tentative technician route"><RouteCard state={panel.state} live={panel.confirmed} /></LoadingSurface> : <RouteCard state={panel.state} live={panel.confirmed} />}
        {panel.reviewable && <>
          <InspectionAction data-schedule-review variant="outline" aria-expanded={showFullSchedule} aria-controls="building-schedule" onClick={() => setShowFullSchedule(value => !value)}>{showFullSchedule ? "Hide full schedule" : "Review full schedule"}</InspectionAction>
          {showFullSchedule && <FullSchedule state={panel.state} scheduleId="building-schedule" />}
        </>}
      </div>}
    </aside>
  </main>
}
