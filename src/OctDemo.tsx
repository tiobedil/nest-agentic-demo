import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { PromptBar } from "@/components/chat/PromptBar"
import { StreamingText } from "@/components/chat/StreamingText"
import { Thinking } from "@/components/chat/Thinking"
import { FullSchedule, InspectionAction, LoadingSurface, OperationSuccess, PlanSummary, ResidentCard, RouteCard } from "@/components/inspection/InspectionCards"
import type { RouteState } from "@/lib/inspection-plan"

type Phase = "planning" | "routing" | "review" | "execution"
type Mode = "intro" | "processing" | "loading" | "plan-summary" | "plan-resident" | "plan-panel" | "ready" | "route-original" | "route-applied" | "route-settling" | "route-optimised" | "route-done"
type AssistantMessage = { id: number; role: "assistant"; phase: Phase; adjusted: boolean }
type Message = AssistantMessage | { id: number; role: "user"; text: string }
type PanelState = { state: RouteState; loading: boolean; reviewable: boolean; confirmed: boolean }
type Decision = "recommended" | "confirm"

const planSteps = ["Checking inspection scope", "Assigning technicians", "Building tentative schedules", "Checking resident access history"]
const optimiseSteps = ["Locking Amar’s 5:45 PM access window", "Checking remaining resident constraints", "Regrouping inspections by floor", "Optimising technician route"]
const executeSteps = ["Publishing technician schedules", "Confirming appointment windows", "Applying resident access requirements", "Updating building operations", "Sending resident notifications"]
const reviewSteps = ["Checking plan readiness"]
const openingText = "I’ll schedule the annual in-unit fire-safety inspections for all 116 apartments in Tower C on Tuesday, 13 October, and check resident access history before confirming the plan."
const routeCompletionText = "Route optimised. Amar's appointment preserved."

function AssistantReply({ message, active, confirmed, onReady, onDecision, onReview, onPanelChange }: {
  confirmed: boolean
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
  const [residentDecision, setResidentDecision] = useState<boolean | null>(null)
  const steps = phase === "planning" ? planSteps : phase === "routing" ? optimiseSteps : phase === "review" ? reviewSteps : executeSteps
  const loading = mode === "loading" && traceProgress === steps.length
  const disabled = !active || mode !== "ready"
  const intro = phase === "planning" ? openingText
    : phase === "routing" ? "Optimising Technician 4's route around Amar's 5:45 PM appointment…"
    : phase === "review" ? adjusted ? "The inspection plan is ready to confirm."
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
    const delay = mode === "route-original" ? 850 : mode === "route-applied" ? 1800 : mode === "route-settling" ? 1400 : mode === "loading" ? 700 : mode === "plan-summary" ? 850 : mode === "plan-resident" ? 850 : mode === "plan-panel" ? 500 : mode === "route-done" ? 1600 : null
    if (delay === null) return
    const timer = window.setTimeout(() => {
      if (mode === "route-original") { onPanelChange(id, { state: "exception" }); setMode("route-applied") }
      if (mode === "route-applied") { onPanelChange(id, { state: "optimised" }); setMode("route-settling") }
      if (mode === "loading") setMode(phase === "planning" ? "plan-summary" : phase === "routing" ? "route-original" : "ready")
      if (mode === "plan-summary") setMode("plan-resident")
      if (mode === "plan-resident") setMode("plan-panel")
      if (mode === "plan-panel") setMode("ready")
      if (mode === "route-settling") setMode("route-optimised")
      if (mode === "route-done") onReview(id)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [active, mode, id, onReview, phase, onPanelChange])

  useLayoutEffect(() => {
    if (!active) return
    if (phase === "planning" && mode === "plan-panel") onPanelChange(id, { state: "original", loading: false, reviewable: false, confirmed: false })
    if (phase === "review" && mode === "ready") onPanelChange(id, { reviewable: true })
    if (phase === "execution" && mode === "ready") onPanelChange(id, { confirmed: true })
  }, [active, phase, loading, mode, id, onPanelChange])

  useLayoutEffect(() => {
    if (!active || mode !== "ready") return
    onReady(id)
  }, [active, mode, id, onReady])

  const planningSummary = <div data-plan-summary className="inspection-card-enter rounded-lg">
    <PlanSummary confirmed={confirmed} approved={false} adjusted={false} routesOptimised={false} disabled={disabled} />
  </div>
  const planningResident = <div data-resident-review className="inspection-card-enter rounded-lg focus-visible:outline-2 focus-visible:outline-violet-600">
    <ResidentCard applied={residentDecision} disabled={disabled} onApply={() => { setResidentDecision(true); onDecision(id, "recommended", true) }} />
  </div>
  const showPlanningSummary = ["plan-summary", "plan-resident", "plan-panel", "ready"].includes(mode)
  const showPlanningResident = ["plan-resident", "plan-panel", "ready"].includes(mode)
  const reviewCards = <PlanSummary confirmed={confirmed} approved adjusted={adjusted} routesOptimised disabled={disabled} onConfirm={() => onDecision(id, "confirm", adjusted)} />
  const traceTitle = phase === "planning" ? "Planning Tower C inspections" : phase === "routing" ? "Automatically optimising technician route" : phase === "review" ? "Preparing inspection plan" : "Confirming and notifying residents"
  const showTrace = mode !== "intro"

  return <div data-assistant-message={id} data-phase={phase} data-mode={mode} className="flex flex-col gap-4">
    <StreamingText text={intro} speed={100} onDone={introDone} autoScroll={false} />
    {showTrace && <Thinking title={traceTitle} steps={steps} completed={traceProgress} done={traceProgress === steps.length && mode !== "processing"}  />}
    {phase === "planning" && loading && <LoadingSurface label="Loading Tower C inspection summary">{planningSummary}</LoadingSurface>}
    {phase === "planning" && showPlanningSummary && planningSummary}
    {phase === "planning" && showPlanningResident && planningResident}
    {phase === "routing" && (mode === "route-optimised" || mode === "route-done") && <>
      <div data-route-success className="flex items-center justify-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-normal leading-5 text-emerald-800"><CheckCircle2 aria-hidden="true" className="size-4 shrink-0" /><StreamingText text={routeCompletionText} speed={100} onDone={routeDone} autoScroll={false} /></div>
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
    if (decision === "confirm") appendReply("execution", adjusted, "Confirm & notify residents")
  }, [appendReply])
  const onReview = useCallback((id: number) => { if (activeRef.current === id) appendReply("review", true) }, [appendReply])
  const send = (text: string) => { if (!isThinking && text.trim()) appendReply("planning", true, text.trim()) }
  useLayoutEffect(() => {
    const viewport = scrollRef.current
    const incoming = viewport?.querySelector<HTMLElement>(`[data-assistant-message="${activeId}"]`)
    if (!viewport || !incoming) return
    if (!isThinking) {
      const frame = window.requestAnimationFrame(() => {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "auto" })
      })
      return () => window.cancelAnimationFrame(frame)
    }
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
    changes.observe(incoming, { childList: true, subtree: true, characterData: true, attributes: true })
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "auto" })
    return () => {
      resize.disconnect()
      changes.disconnect()
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [activeId, isThinking])

  return <main className="oct-demo flex h-full min-w-0 flex-col overflow-hidden bg-background font-sans lg:flex-row">
    <section aria-label="Conversation" className={`flex min-h-0 min-w-0 flex-1 flex-col ${panelOpen ? "max-lg:basis-1/2" : ""}`}>
    <div ref={scrollRef} data-chat-scroll className="flex-1 overflow-y-auto bg-white">
      {messages.length === 0 ? <div className="flex min-h-full items-start justify-center bg-white p-6 pt-12 md:pt-[240px]">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
          <div className="space-y-4 text-center">
            <h1 className="text-[36px] font-semibold leading-none tracking-tight text-foreground/80">What would you like to get done?</h1>
            <p className="text-sm text-muted-foreground">Ask me to help plan, coordinate or manage an operational task.</p>
          </div>
          <PromptBar onSend={send} isThinking={isThinking} />
        </div>
      </div> : <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8" role="log" aria-label="Inspection planning conversation">
        <h1 className="sr-only">Inspection planning conversation</h1>
        {messages.map(message => message.role === "user"
          ? <div key={message.id} className="max-w-[78%] self-end rounded-2xl rounded-br-[6px] bg-violet-100 px-4 py-2.5 text-sm text-violet-950">{message.text}</div>
          : <AssistantReply key={message.id} message={message} confirmed={panel?.confirmed ?? false} active={activeId === message.id} onReady={onReady} onDecision={onDecision} onReview={onReview} onPanelChange={onPanelChange} />)}
      </div>}
    </div>
    {messages.length > 0 && <div className="flex shrink-0 justify-center px-4 pb-6"><PromptBar onSend={send} isThinking={isThinking} /></div>}
    </section>
    <aside aria-label="Inspection plan review" hidden={!panelOpen} className={panelOpen ? "inspection-panel-enter flex min-h-0 min-w-0 flex-col border-t border-slate-200 bg-slate-50 max-lg:flex-1 lg:w-[42%] lg:min-w-[440px] lg:max-w-[720px] lg:shrink-0 lg:border-t-0 lg:border-l" : "hidden"}>
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 lg:px-5">
        <h2 className="text-base font-semibold text-slate-800">Inspection schedule</h2>
      </header>
      {panel && <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {panel.loading ? <LoadingSurface label="Loading tentative technician route"><RouteCard state={panel.state} live={panel.confirmed} /></LoadingSurface> : <RouteCard state={panel.state} live={panel.confirmed} />}
        {panel.reviewable && <>
          <InspectionAction data-schedule-review variant="outline" className="border-slate-200" aria-expanded={showFullSchedule} aria-controls="building-schedule" onClick={() => setShowFullSchedule(value => !value)}>{showFullSchedule ? "Hide full schedule" : "Review full schedule"}</InspectionAction>
          {showFullSchedule && <FullSchedule state={panel.state} scheduleId="building-schedule" />}
        </>}
      </div>}
    </aside>
  </main>
}
