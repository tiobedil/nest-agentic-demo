import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { ComponentProps, ReactNode } from "react"
import { ArrowRight, Check, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { buildingSchedule, routeFor } from "@/lib/inspection-plan"
import { parseCssDuration } from "@/lib/inspection-motion"
import type { RouteState } from "@/lib/inspection-plan"

export function InspectionAction({ className = "", variant = "default", ...props }: ComponentProps<typeof Button>) {
  return <Button variant={variant} className={`h-[40px] w-full gap-2 rounded-[8px] px-[14px] text-[16px] font-semibold leading-[24px] ${variant === "default" ? "bg-violet-600 text-white hover:bg-violet-700" : "text-slate-700"} ${className}`} {...props} />
}

export function LoadingSurface({ children, label }: { children: ReactNode; label: string }) {
  return <div role="status" aria-label={label} aria-busy="true" data-loading-surface>
    <div aria-hidden="true" inert className="oct-skeleton pointer-events-none flex flex-col gap-4 motion-safe:animate-pulse">{children}</div>
  </div>
}

export function RouteCard({ state, live }: { state: RouteState; live: boolean }) {
  const stops = routeFor[state]
  const [amarArrived, setAmarArrived] = useState(state !== "original")
  const cardRef = useRef<HTMLDivElement>(null)
  const positions = useRef(new Map<string, string>())
  const animations = useRef(new Map<string, Animation>())

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return
    const style = getComputedStyle(card)
    const duration = parseCssDuration(style.getPropertyValue("--inspection-route-duration"))
    const easing = style.getPropertyValue("--ease-in-out").trim()
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let cancelled = false
    if (state === "original") setAmarArrived(false)
    for (const element of card.querySelectorAll<HTMLElement>("[data-route-position]")) {
      const key = element.dataset.routePosition!
      const target = element.style.transform
      const running = animations.current.get(key)
      const previous = running?.playState === "running" ? getComputedStyle(element).transform : positions.current.get(key)
      running?.cancel()
      if (previous && previous !== target && duration > 0 && easing && !reducedMotion) {
        const animation = element.animate([{ transform: previous }, { transform: target }], { duration, easing })
        animations.current.set(key, animation)
        if (key === "visit-605" && state !== "original") {
          setAmarArrived(false)
          animation.onfinish = () => {
            if (!cancelled) setAmarArrived(true)
          }
        }
      } else {
        animations.current.delete(key)
        if (key === "visit-605" && state !== "original") setAmarArrived(true)
      }
      positions.current.set(key, target)
    }
    return () => { cancelled = true }
  }, [state])

  useEffect(() => {
    const current = animations.current
    return () => { for (const animation of current.values()) animation.cancel() }
  }, [])

  const constraint = !amarArrived
    ? { row: "bg-amber-50", label: "text-amber-800", pill: "bg-amber-100 text-amber-900" }
    : { row: "bg-violet-100 ring-1 ring-inset ring-violet-500", label: "text-violet-800", pill: "bg-violet-600 text-white" }
  return <Card ref={cardRef} className="@container h-fit shrink-0 gap-0 p-4 shadow-none">
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div><p className="text-xs text-slate-500">Technician 4 · Afternoon visits</p><h2 className="mt-1 text-base font-semibold text-slate-800">{state === "original" ? "Tentative route" : state === "exception" ? "Updated tentative route" : "Optimised route"}</h2></div>
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${live ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{live ? "Confirmed" : "Tentative"}</span>
    </div>
    <div className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${state === "original" ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}><div className="min-h-0 overflow-hidden">
    <div data-route-efficiency className="mb-3 grid" aria-live="polite">
      {([
        { phase: "exception", text: "3 floor changes · Optimisation pending", colour: "bg-amber-50 text-amber-800" },
        { phase: "optimised", text: "Floor changes: 3 → 1 · 2 fewer", colour: "bg-emerald-50 text-emerald-800" },
      ] as const).map(item => <p key={item.phase} aria-hidden={state !== item.phase} className={`col-start-1 row-start-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-opacity duration-200 ease-out motion-reduce:transition-none ${item.colour} ${state === item.phase ? "opacity-100" : "pointer-events-none opacity-0"}`}>{item.text}</p>)}
    </div>
    </div></div>
    <div className="grid grid-cols-[4rem_minmax(0,1fr)_auto] sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] gap-2 px-2 text-xs text-slate-500" aria-hidden="true"><span>Time</span><span>Apartment</span><span className="text-right">Floor</span></div>
    <div role="list" aria-label="Technician 4 afternoon route" className="relative mt-2 shrink-0" style={{ height: stops.length * 52 }}>
      <div aria-hidden="true" data-route-times className="pointer-events-none absolute inset-0 z-20">
        {stops.map(stop => <div key={stop.time} className="flex h-[52px] items-center px-2"><span className="text-xs tabular-nums text-slate-600">{stop.time}</span></div>)}
      </div>
      {stops.map((stop, index) => <div key={stop.unit} role="listitem" data-route-position={`visit-${stop.unit}`} data-unit={stop.unit} data-time={stop.time} className={`oct-route-row absolute inset-x-0 top-0 grid h-[52px] grid-cols-[4rem_minmax(0,1fr)_auto] sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2 ${stop.amar ? `z-10 ${constraint.row}` : "bg-white"}`} style={{ transform: `translate3d(0, ${index * 100}%, 0)` }}>
        <span className="text-xs tabular-nums text-slate-600 opacity-0">{stop.time}</span>
        <div className="min-w-0"><p className="text-sm font-semibold text-slate-700">Unit {stop.unit}{stop.amar && " · Amar"}</p></div>
        <div className="flex items-center justify-self-end gap-2 whitespace-nowrap">{stop.amar && <span className={`text-[11px] ${constraint.label}`}>{state === "original" ? "Resident constraint" : "Approved"}</span>}<span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${stop.amar ? constraint.pill : stop.floor === 2 ? "bg-sky-100 text-sky-900" : "bg-violet-200 text-violet-900"}`}>Floor {stop.floor}</span></div>
      </div>)}
    </div>
  </Card>
}

export function PlanSummary({ approved, adjusted, routesOptimised, onConfirm, disabled = false }: { approved: boolean; adjusted: boolean; routesOptimised: boolean; onConfirm?: () => void; disabled?: boolean }) {
  return <Card className="gap-0 p-4 shadow-none">
    <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-slate-800">{approved ? "Tower C · Inspection plan ready" : "Tower C · Fire-safety inspections"}</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">Tentative</span></div>
    <p className="mt-3 text-xs text-slate-700">116 apartments · 6 technicians · {approved ? `${adjusted ? 1 : 0} resident adjustment` : "1 requires review"}</p>
    {approved && routesOptimised && <p className="mt-3 flex items-center gap-2 text-xs text-slate-700"><CheckCircle2 className="size-3.5 shrink-0 text-emerald-700" />All routes optimised{adjusted && " · Amar's 5:45 PM slot preserved"}</p>}
    {approved && <><p className="mt-3 text-[11px] text-slate-500">No resident notifications sent yet.</p><InspectionAction disabled={disabled} onClick={onConfirm} className="mt-3 text-sm">Confirm &amp; notify residents<ArrowRight aria-hidden="true" className="size-4" /></InspectionAction></>}
  </Card>
}

export function ResidentCard({ onApply, applied = null, disabled = false }: { onApply: () => void; applied?: boolean | null; disabled?: boolean }) {
  if (applied !== null) return <ResidentAdjustment adjusted={applied} />
  return <Card className="gap-0 p-4 shadow-none">
    <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-slate-800">Amar Sundaran · Unit 605</h2><span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">Access risk</span></div>
    <p className="mt-1 text-[11px] text-slate-500">Resident Intelligence · Access recommendation</p>
    <p className="mt-3 text-xs leading-5 text-slate-700">3 failed daytime visits · 2 successful evening visits · Resident presence required</p>
    <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-slate-100 pt-3">
      <div className="flex flex-col gap-1 text-slate-700"><span className="text-[11px]">Current</span><span className="text-sm font-medium">4:30 PM</span></div>
      <ArrowRight aria-hidden="true" className="size-3 text-slate-500" />
      <div className="flex flex-col items-end gap-1 text-violet-700"><span className="text-[11px]">AI recommended</span><span className="text-sm font-medium">5:45 PM</span></div>
    </div>
    <InspectionAction disabled={disabled} onClick={onApply} className="mt-3 text-sm">Use 5:45 PM</InspectionAction>
  </Card>
}

export function FullSchedule({ state, scheduleId, disabled = false }: { state: RouteState; scheduleId: string; disabled?: boolean }) {
  return <Card id={scheduleId} className="gap-3 p-4 shadow-none"><h2 className="text-base font-semibold text-slate-800">Full Tower C schedule · 116 apartments</h2><p className="text-xs leading-5 text-slate-600">Appointment windows and resident access requirements are included for all 116 apartments.</p>{buildingSchedule(state).map(route => <details key={route.technician} className="rounded-lg bg-slate-50 p-3"><summary aria-disabled={disabled} tabIndex={disabled ? -1 : 0} onClick={event => { if (disabled) event.preventDefault() }} onKeyDown={event => { if (disabled && (event.key === "Enter" || event.key === " ")) event.preventDefault() }} className={`rounded text-sm font-medium text-slate-700 focus-visible:outline-2 focus-visible:outline-violet-600 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>Technician {route.technician} · {route.stops.length} apartments</summary><table className="mt-3 w-full text-left text-xs text-slate-700"><caption className="sr-only">Technician {route.technician} appointments on Tuesday, 13 October</caption><thead><tr><th scope="col" className="pb-2">Time</th><th scope="col" className="pb-2">Apartment</th><th scope="col" className="pb-2">Floor</th></tr></thead><tbody>{route.stops.map(stop => <tr key={stop.unit}><td className="py-2 tabular-nums">{stop.time}</td><td>Unit {stop.unit}{stop.unit === "605" && " · Amar"}</td><td>{stop.floor}</td></tr>)}</tbody></table></details>)}</Card>
}


export function ResidentAdjustment({ adjusted }: { adjusted: boolean }) {
  return <Card className="gap-0 p-3 shadow-none">
    <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800"><CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-700" />Amar Sundaran · Unit 605</h2><span className={`rounded-full px-2 py-0.5 text-[11px] ${adjusted ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{adjusted ? "Applied" : "Retained"}</span></div>
    <p className="mt-1 text-xs text-slate-600">{adjusted ? "5:45 PM approved" : "4:30 PM retained · Access risk acknowledged"} · Resident-present access</p>
  </Card>
}

export function OperationSuccess({ adjusted }: { adjusted: boolean }) {
  return <Card className="gap-0 p-5 shadow-none">
    <CheckCircle2 aria-hidden="true" className="size-8 text-emerald-700" />
    <h2 className="mt-3 text-xl font-semibold text-slate-800">Inspection plan live</h2>
    <p className="mt-2 text-sm font-semibold text-slate-700">116 / 116 apartments scheduled</p>
    <div className="mt-5 space-y-3">{[
      "6 technician routes confirmed", adjusted ? "Amar’s 5:45 PM access requirement accommodated" : "Amar’s 4:30 PM standard slot retained by operator", "Resident appointment windows confirmed", "Building operations updated", "Notifications sent", "No unresolved scheduling conflicts",
    ].map(item => <p key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700"><Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-emerald-700" />{item}</p>)}</div>
    {!adjusted && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Amar’s higher failed-access risk remains. Resident-present access is required.</p>}
    <p className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">First inspection: Tuesday, 13 October · 9:00 AM</p>
    <p className="mt-3 text-xs leading-5 text-slate-500">No further action is required.</p>
  </Card>
}
