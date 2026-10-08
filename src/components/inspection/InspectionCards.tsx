import { useId, useState } from "react"
import type { ComponentProps, ReactNode } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { buildingSchedule, routeFor } from "@/lib/inspection-plan"
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
  return <Card className="gap-0 p-4 shadow-none">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
      <div><p className="text-xs text-slate-500">Technician 4 · Afternoon visits</p><h2 className="mt-1 text-base font-semibold text-slate-800">{state === "original" ? "Tentative route" : state === "exception" ? "Updated tentative route" : "Optimised route"}</h2></div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{live ? "Confirmed" : "Tentative"}</span>
    </div>
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_4rem] gap-2 px-2 text-xs text-slate-500" aria-hidden="true"><span>Time</span><span>Apartment</span><span className="text-right">Floor</span></div>
    <div role="list" aria-label="Technician 4 afternoon route" className="relative mt-2 h-[32rem]">
      {stops.map((stop, index) => <div key={stop.unit} role="listitem" data-unit={stop.unit} data-time={stop.time} className={`oct-route-row absolute inset-x-0 top-0 grid h-16 grid-cols-[4.5rem_minmax(0,1fr)_4rem] items-center gap-2 rounded-lg px-2 ${stop.amar ? "z-10 bg-violet-50" : "bg-white"}`} style={{ transform: `translateY(${index * 100}%)` }}>
        <span className="text-xs tabular-nums text-slate-600">{stop.time}</span>
        <div className="min-w-0"><p className="text-sm font-semibold text-slate-700">Unit {stop.unit}{stop.amar && " · Amar"}</p>{stop.amar && <p className="mt-1 text-[11px] leading-4 text-violet-700">{state === "original" ? "Resident constraint" : "Pinned · Resident constraint"}</p>}</div>
        <span className={`justify-self-end rounded-full px-2 py-1 text-[11px] font-medium ${stop.floor === 2 ? "bg-slate-100 text-slate-700" : "bg-violet-100 text-violet-800"}`}>Floor {stop.floor}</span>
      </div>)}
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600"><span>Floor sequence</span><span className="font-semibold tracking-wide">{stops.map(stop => stop.floor).join(" · ")}</span></div>
  </Card>
}

export function PlanSummary({ approved, adjusted, routesOptimised, onReview, disabled = false }: { approved: boolean; adjusted: boolean; routesOptimised: boolean; onReview: () => void; disabled?: boolean }) {
  const metrics = approved
    ? [{ value: "116", label: "Apartments" }, { value: "6", label: "Technicians" }, { value: adjusted ? "1" : "0", label: "Resident-specific adjustment" }, { value: "6", label: routesOptimised ? "Optimised routes" : "Routes being checked" }]
    : [{ value: "116", label: "Apartments" }, { value: "6", label: "Technicians" }, { value: "115", label: "Standard schedule" }]
  return <Card className="gap-0 p-4 shadow-none">
    <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-base font-semibold text-slate-800">{approved && routesOptimised ? "Tower C inspection plan ready" : "Tower C — Fire-safety inspections"}</h2><p className="mt-1 text-xs text-slate-500">Tuesday, 13 October · 9:00 AM–6:00 PM</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">Tentative</span></div>
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{metrics.map(item => <div key={item.label} className="rounded-lg bg-slate-50 p-3"><p className="text-xl font-semibold text-slate-800">{item.value}</p><p className="mt-1 text-xs leading-5 text-slate-600">{item.label}</p></div>)}{!approved && <Button variant="ghost" disabled={disabled} onClick={onReview} className="h-auto flex-col items-start gap-1 whitespace-normal rounded-lg bg-amber-50 p-3 text-left text-amber-900 hover:bg-amber-100"><span className="text-xl font-semibold">1</span><span className="text-xs">Requires review →</span></Button>}</div>
    {!approved && <p className="mt-4 text-sm leading-6 text-slate-600">I found one resident where the standard appointment is more likely to result in failed access.</p>}
  </Card>
}

export function ResidentCard({ onApply, onKeep, disabled = false }: { onApply: () => void; onKeep: () => void; disabled?: boolean }) {
  const [selected, setSelected] = useState("recommended")
  const appointmentId = useId()
  return <Card className="gap-0 p-4 shadow-none">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium text-amber-800">Requires review</p><h2 className="mt-1 text-lg font-semibold text-slate-800">Amar Sundaran</h2><p className="text-sm text-slate-500">Unit 605</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">Higher failed-access risk</span></div>
    <div className="mt-4 space-y-3 rounded-lg bg-slate-50 p-3">{[
      ["3 recent weekday daytime visits", "No access"], ["Resident-present access", "Previously requested for in-unit visits"], ["2 previous evening visits", "Successfully completed after 5:30 PM"],
    ].map(([title, body]) => <div key={title}><p className="text-xs font-medium text-slate-700">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{body}</p></div>)}</div>
    <fieldset disabled={disabled} className="mt-4"><legend className="text-sm font-medium text-slate-700">Choose Amar’s appointment</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{[
      { id: "standard", title: "Keep standard slot", time: "4:30 PM", description: "Current tentative appointment" },
      { id: "recommended", title: "Recommended for Amar", time: "5:45 PM", description: "Higher likelihood of successful access" },
    ].map(option => <label key={option.id} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 ${selected === option.id ? "border-violet-300 bg-violet-50" : "border-slate-200"}`}><input type="radio" name={appointmentId} value={option.id} checked={selected === option.id} onChange={() => setSelected(option.id)} className="mt-1 accent-violet-600" /><span><span className="block text-xs font-medium text-slate-700">{option.title}</span><span className="mt-1 block text-lg font-semibold text-slate-800">{option.time}</span><span className="mt-1 block text-xs leading-5 text-slate-600">{option.description}</span></span></label>)}</div></fieldset>
    <p className="mt-4 text-sm leading-6 text-slate-600">His previous access history indicates that a later appointment is more likely to result in successful access.</p>
    {selected === "standard" && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Keeping 4:30 PM leaves the higher failed-access risk in place. Resident-present access will still be required.</p>}
    <InspectionAction disabled={disabled} onClick={selected === "recommended" ? onApply : onKeep} className="mt-4">{selected === "recommended" ? "Use 5:45 PM" : "Keep 4:30 PM"}<ArrowRight aria-hidden="true" className="size-4" /></InspectionAction>
  </Card>
}

export function FullSchedule({ state, scheduleId, disabled = false }: { state: RouteState; scheduleId: string; disabled?: boolean }) {
  return <Card id={scheduleId} className="gap-3 p-4 shadow-none"><h2 className="text-base font-semibold text-slate-800">Full Tower C schedule · 116 apartments</h2><p className="text-xs leading-5 text-slate-600">Demo data: Technician 4’s eight afternoon visits follow the supplied scenario. The other 108 appointments are illustrative, not connected to live building records. All visits require resident-present access where requested.</p>{buildingSchedule(state).map(route => <details key={route.technician} className="rounded-lg bg-slate-50 p-3"><summary aria-disabled={disabled} tabIndex={disabled ? -1 : 0} onClick={event => { if (disabled) event.preventDefault() }} onKeyDown={event => { if (disabled && (event.key === "Enter" || event.key === " ")) event.preventDefault() }} className={`rounded text-sm font-medium text-slate-700 focus-visible:outline-2 focus-visible:outline-violet-600 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>Technician {route.technician} · {route.stops.length} apartments</summary><table className="mt-3 w-full text-left text-xs text-slate-700"><caption className="sr-only">Technician {route.technician} appointments on Tuesday, 13 October</caption><thead><tr><th scope="col" className="pb-2">Time</th><th scope="col" className="pb-2">Apartment</th><th scope="col" className="pb-2">Floor</th></tr></thead><tbody>{route.stops.map(stop => <tr key={stop.unit}><td className="py-2 tabular-nums">{stop.time}</td><td>Unit {stop.unit}{stop.unit === "605" && " · Amar"}</td><td>{stop.floor}</td></tr>)}</tbody></table></details>)}</Card>
}


export function ResidentAdjustment({ adjusted }: { adjusted: boolean }) {
  return <Card className="gap-3 p-4 shadow-none">
    <div><h2 className="text-sm font-semibold text-slate-800">Amar Sundaran · Unit 605</h2><p className="mt-1 text-sm text-violet-800">{adjusted ? "5:45 PM" : "4:30 PM"} · Resident-present access</p></div>
    {!adjusted && <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Standard slot retained. Higher failed-access risk acknowledged; no resident-specific time adjustment was made.</p>}
    <p className="text-sm leading-6 text-slate-600">No appointments have been communicated yet.</p>
  </Card>
}

export function OperationSuccess({ adjusted }: { adjusted: boolean }) {
  return <Card className="gap-0 p-5 shadow-none">
    <CheckCircle2 aria-hidden="true" className="size-8 text-emerald-700" />
    <span className="mt-4 w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">Live · Demo</span>
    <h2 className="mt-3 text-xl font-semibold text-slate-800">Inspection plan live</h2>
    <p className="mt-2 text-sm font-semibold text-slate-700">116 / 116 apartments scheduled</p>
    <div className="mt-5 space-y-3">{[
      "6 technician routes confirmed", adjusted ? "Amar’s 5:45 PM access requirement accommodated" : "Amar’s 4:30 PM standard slot retained by operator", "Resident appointment windows confirmed", "Building operations updated", "Notifications sent", "No unresolved scheduling conflicts",
    ].map(item => <p key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700"><CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0 text-emerald-700" />{item}</p>)}</div>
    {!adjusted && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Amar’s higher failed-access risk remains. Resident-present access is required.</p>}
    <p className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">First inspection: Tuesday, 13 October · 9:00 AM</p>
    <p className="mt-3 text-xs leading-5 text-slate-500">Demo complete. No real schedules were published or notifications sent. No further action is required.</p>
  </Card>
}
