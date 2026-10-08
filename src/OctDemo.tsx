import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { PromptBar } from "@/components/chat/PromptBar"
import { StreamingText } from "@/components/chat/StreamingText"
import { Thinking } from "@/components/chat/Thinking"
import { FullSchedule, InspectionAction, LoadingSurface, OperationSuccess, PlanSummary, ResidentAdjustment, ResidentCard, RouteCard } from "@/components/inspection/InspectionCards"
import type { RouteState } from "@/lib/inspection-plan"

type Phase = "planning" | "routing" | "review" | "execution"
type Mode = "intro" | "processing" | "loading" | "ready" | "route-original" | "route-applied" | "route-impact" | "route-settling" | "route-optimised" | "route-done"
type AssistantMessage = { id: number; role: "assistant"; phase: Phase; adjusted: boolean }
type Message = AssistantMessage | { id: number; role: "user"; text: string }
type Decision = "recommended" | "standard" | "confirm"

const planSteps = ["Checking inspection scope…", "Assigning technicians…", "Building tentative schedules…", "Checking resident access history…", "Generating UI"]
const optimiseSteps = ["Locking Amar’s 5:45 PM access window…", "Checking remaining resident constraints…", "Regrouping inspections by floor…", "Optimising technician route…", "Generating UI"]
const executeSteps = ["Publishing technician schedules…", "Confirming appointment windows…", "Applying resident access requirements…", "Updating building operations…", "Sending resident notifications…", "Generating UI"]
const reviewSteps = ["Generating UI"]
const openingText = "I’ll schedule the annual in-unit fire-safety inspections for all 116 apartments in Tower C on Tuesday, 13 October, and check resident access history before confirming the plan."
const routeImpactText = "Amar’s new access window affects the current technician route. I’ll preserve his approved 5:45 PM appointment and regroup the remaining inspections by floor."
const routeCompletionText = "Amar’s 5:45 PM access window is preserved, while the remaining inspections have been regrouped into continuous floor blocks."

function AssistantReply({ message, active, onReady, onDecision, onReview }: {
  message: AssistantMessage
  active: boolean
  onReady: (id: number) => void
  onDecision: (id: number, decision: Decision, adjusted: boolean) => void
  onReview: (id: number) => void
}) {
  const { id, phase, adjusted } = message
  const [mode, setMode] = useState<Mode>("intro")
  const [traceProgress, setTraceProgress] = useState(0)
  const [routeState, setRouteState] = useState<RouteState>("original")
  const [showFullSchedule, setShowFullSchedule] = useState(false)
  const residentRef = useRef<HTMLDivElement>(null)
  const scheduleId = `building-schedule-${id}`
  const steps = phase === "planning" ? planSteps : phase === "routing" ? optimiseSteps : phase === "review" ? reviewSteps : executeSteps
  const loading = mode === "loading" && traceProgress === steps.length
  const disabled = !active || mode !== "ready"
  const intro = phase === "planning" ? openingText
    : phase === "routing" ? "I’ll move Amar to 5:45 PM and put Unit 205 into the released 4:30 PM slot. All other appointments stay unchanged while I check the route impact."
    : phase === "review" ? adjusted ? "The Tower C inspection plan is ready for your approval. Amar’s 5:45 PM resident-present appointment is preserved and all six routes are optimised. No appointments have been communicated yet."
      : "I’ll keep Amar’s standard 4:30 PM appointment as requested. His higher failed-access risk remains. Review the building-level plan before confirming and notifying residents."
    : "I’ll publish the approved technician schedules, confirm all 116 appointment windows, apply resident access requirements, and notify residents."
  const introDone = useCallback(() => setMode(phase === "routing" ? "route-original" : "processing"), [phase])
  const impactDone = useCallback(() => setMode("processing"), [])
  const routeDone = useCallback(() => setMode("route-done"), [])

  useEffect(() => {
    if (!active || mode !== "processing") return
    const timers = steps.map((_, index) => window.setTimeout(() => setTraceProgress(index + 1), (index + 1) * 850))
    timers.push(window.setTimeout(() => {
      if (phase === "routing") { setRouteState("optimised"); setMode("route-settling") }
      else setMode("loading")
    }, steps.length * 850 + 450))
    return () => timers.forEach(window.clearTimeout)
  }, [active, mode, phase, steps])

  useEffect(() => {
    if (!active) return
    const delay = mode === "route-original" ? 250 : mode === "route-applied" ? 1800 : mode === "loading" || mode === "route-settling" ? 700 : mode === "route-done" ? 1600 : null
    if (delay === null) return
    const timer = window.setTimeout(() => {
      if (mode === "route-original") { setRouteState("exception"); setMode("route-applied") }
      if (mode === "route-applied") setMode("route-impact")
      if (mode === "loading") setMode("ready")
      if (mode === "route-settling") setMode("route-optimised")
      if (mode === "route-done") onReview(id)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [active, mode, id, onReview])

  useEffect(() => {
    if (active && mode === "ready") onReady(id)
  }, [active, mode, id, onReady])

  const reviewResident = () => {
    if (disabled) return
    residentRef.current?.scrollIntoView({ block: "center" })
    residentRef.current?.focus({ preventScroll: true })
  }
  const planningCards = <>
    <PlanSummary approved={false} adjusted={false} routesOptimised={false} onReview={reviewResident} disabled={disabled} />
    <div ref={mode === "ready" ? residentRef : undefined} tabIndex={mode === "ready" && active ? -1 : undefined} className="rounded-lg focus-visible:outline-2 focus-visible:outline-violet-600">
      <ResidentCard disabled={disabled} onApply={() => onDecision(id, "recommended", true)} onKeep={() => onDecision(id, "standard", false)} />
    </div>
    <RouteCard state="original" live={false} />
  </>
  const reviewCards = <>
    <PlanSummary approved adjusted={adjusted} routesOptimised onReview={reviewResident} disabled={disabled} />
    <ResidentAdjustment adjusted={adjusted} />
    <InspectionAction variant="outline" disabled={disabled} aria-expanded={showFullSchedule} aria-controls={scheduleId} onClick={() => setShowFullSchedule(value => !value)}>{showFullSchedule ? "Hide full schedule" : "Review full schedule"}</InspectionAction>
    {showFullSchedule && <FullSchedule state={adjusted ? "optimised" : "original"} scheduleId={scheduleId} disabled={disabled} />}
    <InspectionAction disabled={disabled} onClick={() => onDecision(id, "confirm", adjusted)}>Confirm &amp; notify residents<ArrowRight aria-hidden="true" className="size-4" /></InspectionAction>
    <p className="text-center text-xs leading-5 text-slate-500">The plan remains tentative until you confirm. No residents have been notified.</p>
  </>
  const traceTitle = phase === "planning" ? "Planning Tower C inspections" : phase === "routing" ? "Automatically optimising technician route" : phase === "review" ? "Preparing inspection plan" : "Confirming and notifying residents"
  const showTrace = mode !== "intro" && (phase !== "routing" || ["processing", "route-settling", "route-optimised", "route-done"].includes(mode))

  return <div data-assistant-message={id} data-phase={phase} data-mode={mode} className="flex flex-col gap-4">
    <StreamingText text={intro} speed={18} onDone={introDone} autoScroll={active} />
    {phase === "routing" && ["route-impact", "processing", "route-settling", "route-optimised", "route-done"].includes(mode) && <StreamingText text={routeImpactText} speed={18} onDone={impactDone} autoScroll={false} />}
    {showTrace && <Thinking title={traceTitle} steps={steps} completed={traceProgress} disabled={!active} />}
    {phase === "planning" && loading && <LoadingSurface label="Loading tentative plan, resident review and technician route">{planningCards}</LoadingSurface>}
    {phase === "planning" && mode === "ready" && planningCards}
    {phase === "routing" && mode !== "intro" && <RouteCard state={routeState} live={false} />}
    {phase === "routing" && (mode === "route-optimised" || mode === "route-done") && <>
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 aria-hidden="true" className="size-4" />Route optimised</div>
      <StreamingText text={routeCompletionText} speed={18} onDone={routeDone} autoScroll={active && mode === "route-optimised"} />
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
  const nextId = useRef(0)
  const activeRef = useRef<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const appendReply = useCallback((phase: Phase, adjusted: boolean, userText?: string) => {
    const additions: Message[] = []
    if (userText) additions.push({ id: ++nextId.current, role: "user", text: userText })
    const id = ++nextId.current
    additions.push({ id, role: "assistant", phase, adjusted })
    activeRef.current = id
    setActiveId(id)
    setIsThinking(true)
    setMessages(current => [...current, ...additions])
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
  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "end" }) }, [messages])

  return <main className="oct-demo flex h-full flex-col bg-background font-sans">
    <div className="flex-1 overflow-y-auto bg-white">
      {messages.length === 0 ? <div className="flex min-h-full items-start justify-center bg-white p-6 pt-12 md:pt-[240px]">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
          <div className="space-y-4 text-center">
            <h1 className="text-[36px] font-semibold leading-none tracking-tight text-foreground/80">How can I help you today?</h1>
            <p className="text-sm text-muted-foreground">Start a conversation. The assistant replies with the same message for now.</p>
          </div>
          <PromptBar onSend={send} isThinking={isThinking} />
        </div>
      </div> : <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8" role="log" aria-label="Inspection planning conversation">
        <h1 className="sr-only">Oct Demo inspection planning conversation</h1>
        {messages.map(message => message.role === "user"
          ? <div key={message.id} className="max-w-[78%] self-end rounded-2xl rounded-br-[6px] bg-violet-100 px-4 py-2.5 text-sm text-violet-950">{message.text}</div>
          : <AssistantReply key={message.id} message={message} active={activeId === message.id} onReady={onReady} onDecision={onDecision} onReview={onReview} />)}
        <div ref={bottomRef} />
      </div>}
    </div>
    {messages.length > 0 && <div className="flex shrink-0 justify-center px-4 pb-6"><PromptBar onSend={send} isThinking={isThinking} /></div>}
  </main>
}
