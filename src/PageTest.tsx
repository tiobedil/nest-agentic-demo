import { TopNavbar } from "@/components/TopNavbar"
import { useEffect, useRef, useState } from "react"
import { Search, Filter, Download, Settings, Plus, AlertTriangle, MoreVertical, Sparkle, Copy, ArrowUpDown, UserPlus, Check, X, CircleCheck, CircleX } from "lucide-react"
import { Thinking } from "@/components/chat/Thinking"
import { StreamingText } from "@/components/chat/StreamingText"
import { PromptBar } from "@/components/chat/PromptBar"

const TABS = [
  { label: "All Tasks" },
  { label: "Completed Tasks" },
  { label: "SLA Breaches" },
  { label: "My Tasks", count: 5 },
] as const

type SlaState = "blue" | "yellow" | "orange" | "breach" | "completed" | "completedBreach"

const TASKS = [
  { id: "323942", title: "Pipe leak", status: "Resolved", sla: { state: "completed" as SlaState, label: "Resolved in 55m" }, priority: "P1", assignees: ["AB"], building: { name: "Al Mansour Hotel", location: "Dubai, UAE", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&h=80&fit=crop" } },
  { id: "212312", title: "Clogged air vent", status: "Assigned", sla: { state: "blue" as SlaState, label: "1h 30m left" }, priority: "P2", assignees: ["AB", "EF", "+2"], building: { name: "Al Barsha Heights", location: "Riyadh, KSA", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=80&h=80&fit=crop" } },
  { id: "123456", title: "Mold growth", status: "Resolved", sla: { state: "completed" as SlaState, label: "Resolved in 55m" }, priority: "P3", assignees: ["AB"], building: { name: "Desert Oasis", location: "Riyadh, KSA", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=80&h=80&fit=crop" } },
  { id: "334567", title: "Broken light fixture", status: "Assigned", sla: { state: "blue" as SlaState, label: "6h left" }, priority: "P4", assignees: ["AB", "EF", "+2"], building: { name: "Palm Villa", location: "Riyadh, KSA", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=80&h=80&fit=crop" } },
  { id: "123533", title: "Dripping faucet", status: "On Hold", sla: { state: "breach" as SlaState, label: "Overdue 1m" }, priority: "P5", assignees: ["CD"], building: { name: "Al Barari", location: "Dubai, UAE", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=80&h=80&fit=crop" } },
  { id: "775544", title: "Worn carpet", status: "In Progress", sla: { state: "yellow" as SlaState, label: "29m left" }, priority: "P6", assignees: ["AB"], building: { name: "Seventh Heaven", location: "Riyadh, KSA", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=80&h=80&fit=crop" } },
  { id: "212312", title: "Shattered window", status: "Canceled", sla: { state: "blue" as SlaState, label: "—" }, priority: "P2", assignees: ["EF"], building: { name: "The Oasis Residence", location: "Dubai, UAE", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=80&h=80&fit=crop" } },
  { id: "123124", title: "Freezer malfunction", status: "Resolved", sla: { state: "completedBreach" as SlaState, label: "Resolved 5m late" }, priority: "P1", assignees: ["CD"], building: { name: "Desert Mirage Suites", location: "Dubai, UAE", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=80&h=80&fit=crop" } },
  { id: "123355", title: "Overflowing toilet", status: "Canceled", sla: { state: "blue" as SlaState, label: "—" }, priority: "P4", assignees: ["EF"], building: { name: "Residence 8", location: "Riyadh, KSA", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=80&h=80&fit=crop" } },
  { id: "212312", title: "Stuck elevator door", status: "On Hold", sla: { state: "breach" as SlaState, label: "1h 30m Overdue" }, priority: "P3", assignees: ["AB"], building: { name: "Emerald Manor", location: "Riyadh, KSA", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=80&h=80&fit=crop" } },
] as const

const STATUS_STYLES: Record<string, { bg: string; text: string; w: string }> = {
  Resolved: { bg: "bg-[#dcfce7]", text: "text-[#0d542b]", w: "w-[69px]" },
  Assigned: { bg: "bg-[#ddd6ff]", text: "text-[#4d179a]", w: "w-[69px]" },
  "On Hold": { bg: "bg-amber-100", text: "text-amber-800", w: "w-[69px]" },
  "In Progress": { bg: "bg-sky-100", text: "text-sky-800", w: "w-[90px]" },
  Canceled: { bg: "bg-rose-100", text: "text-rose-700", w: "w-[69px]" },
}

const PRIORITY_STYLES: Record<string, string> = {
  P1: "bg-rose-100 text-rose-700",
  P2: "bg-pink-100 text-pink-700",
  P3: "bg-amber-100 text-amber-800",
  P4: "bg-emerald-100 text-emerald-700",
  P5: "bg-orange-100 text-orange-700",
  P6: "bg-violet-100 text-violet-700",
}

function HeaderCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex h-12 items-center gap-3 px-4 ${className}`}>
      <span className="truncate text-[14px] font-bold text-slate-700">{children}</span>
      <ArrowUpDown className="size-4 shrink-0 text-slate-500" />
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: "bg-slate-100", text: "text-slate-700", w: "w-auto" }
  return (
    <div className={`flex h-6 items-center justify-center rounded-full p-1 ${s.bg} ${s.w}`}>
      <span className={`px-1 text-[12px] font-normal ${s.text}`}>{status}</span>
    </div>
  )
}

function PriorityBadge({ p }: { p: string }) {
  return (
    <div className={`flex h-6 w-10 items-center justify-center rounded-full ${PRIORITY_STYLES[p] ?? "bg-slate-100 text-slate-700"}`}>
      <span className="text-[12px] font-semibold leading-none">{p}</span>
    </div>
  )
}

function SlaProgressBar({ state }: { state: SlaState }) {
  const filled = state === "blue" ? "bg-[#2b7fff]" : state === "yellow" ? "bg-[#ffd230]" : "bg-[#e2e8f0]"
  const empty = "bg-[#e2e8f0]"
  const fillCount = state === "blue" ? 3 : state === "yellow" ? 2 : state === "orange" ? 1 : 0
  return (
    <div className="flex w-full items-center gap-[2px]">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`h-1 flex-1 rounded-full ${i < fillCount ? filled : empty}`} />
      ))}
    </div>
  )
}

function SlaCell({ sla }: { sla: { state: SlaState; label: string } }) {
  if (sla.state === "completed") {
    return (
      <div className="flex h-[60px] items-center border-b border-[#cad5e2] px-4">
        <div className="flex items-center gap-1.5">
          <CircleCheck className="size-4" style={{ color: "#00A63E" }} />
          <span className="text-[12px] font-semibold text-slate-700">{sla.label}</span>
        </div>
      </div>
    )
  }
  if (sla.state === "completedBreach") {
    return (
      <div className="flex h-[60px] items-center border-b border-[#cad5e2] px-4">
        <div className="flex items-center gap-1.5">
          <CircleX className="size-4" style={{ color: "#FB2C36" }} />
          <span className="text-[12px] font-semibold text-slate-700">{sla.label}</span>
        </div>
      </div>
    )
  }
  if (sla.state === "breach") {
    return (
      <div className="flex h-[60px] items-center border-b border-[#cad5e2] px-4">
        <div className="flex items-center gap-1.5">
          <CircleX className="size-4" style={{ color: "#FB2C36" }} />
          <span className="text-[12px] font-semibold text-slate-700">{sla.label}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-[60px] flex-col items-start justify-center gap-2 border-b border-[#cad5e2] px-4">
      <span className="text-[12px] font-semibold text-slate-700">{sla.label}</span>
      <SlaProgressBar state={sla.state} />
    </div>
  )
}

function Assignee({ items }: { items: readonly string[] }) {
  return (
    <div className="flex h-[60px] items-center gap-3 border-b border-[#cad5e2] px-4">
      <div className="flex items-center">
        {items.slice(0, 4).map((a, i) => (
          <div
            key={i}
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 text-[14px] font-medium text-white ${
              a.startsWith("+") ? "bg-slate-500" : "bg-slate-500"
            } ${i > 0 ? "-ml-2" : ""}`}
            style={{ zIndex: items.length - i }}
          >
            {a}
          </div>
        ))}
        <button
          className="flex -ml-2 h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          aria-label="Add assignee"
        >
          <UserPlus className="size-4" />
        </button>
      </div>
    </div>
  )
}

function Building({ name, location, image }: { name: string; location: string; image: string }) {
  return (
    <div className="flex h-[60px] items-center gap-3 border-b border-[#cad5e2] px-4">
      <img src={image} alt={name} className="size-10 shrink-0 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-normal text-slate-700">{name}</div>
        <div className="truncate text-[12px] text-slate-500">{location}</div>
      </div>
    </div>
  )
}

export function PageTest() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["label"]>("All Tasks")
  const [search, setSearch] = useState("")
  const [chatTurns, setChatTurns] = useState<{ id: string; user: string; done: boolean }[]>([
    { id: "seed-1", user: "test", done: true },
  ])

  const send = (t: string) => setChatTurns((m) => [...m, { id: Date.now().toString(), user: t, done: false }])
  const onThinkingDone = (id: string) => setChatTurns((m) => m.map((t) => (t.id === id ? { ...t, done: true } : t)))
  const isThinking = chatTurns.some((t) => !t.done)
  const REPLY = "This is a mock reply returned for every message to verify the chat flow. The assistant first shows a Thinking state for about six seconds, then streams this paragraph as if it were generated live. In a real implementation this content would be replaced by an LLM response, with support for markdown, code blocks, and follow up actions. For now the text is intentionally longer so you can judge line height, wrapping, and readability in the final layout."

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [scrollMetrics, setScrollMetrics] = useState({ thumbTop: 0, thumbHeight: 0, hasOverflow: false })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const hasOverflow = scrollHeight > clientHeight + 1
      if (!hasOverflow) {
        setScrollMetrics({ thumbTop: 0, thumbHeight: 0, hasOverflow: false })
        return
      }
      const trackHeight = clientHeight - 2
      const thumbHeight = Math.max(40, (clientHeight / scrollHeight) * trackHeight)
      const maxThumbTop = trackHeight - thumbHeight
      const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop
      setScrollMetrics({ thumbTop, thumbHeight, hasOverflow: true })
    }
    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="flex h-dvh flex-col overflow-x-hidden bg-background font-sans">
      <TopNavbar />

      <div className="flex flex-1 min-h-0 overflow-x-hidden">
        {/* Main content */}
        <main className="flex flex-1 min-h-0 flex-col overflow-x-hidden bg-white">
          <div className="mx-auto w-full max-w-none flex-1 min-h-0 px-8 pt-6 pb-6 flex flex-col">
            <div className="flex items-center justify-between pb-2">
              <h1 className="text-lg font-semibold leading-7 text-slate-700">Task Management</h1>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="h-9 w-[320px] rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                  />
                </div>
                <button className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><Filter className="size-3.5" /> Filters</button>
                <button className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><Download className="size-3.5" /> Export</button>
                <button className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"><Settings className="size-3.5" /> Edit Columns</button>
                <button className="flex h-9 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"><Plus className="size-3.5" /> Add New</button>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-1 border-b border-slate-100 pt-2">
              {TABS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setActiveTab(t.label)}
                  className={`relative flex items-center gap-1.5 px-4 py-3 text-sm transition ${activeTab === t.label ? "font-semibold text-violet-600" : "font-normal text-slate-500 hover:text-slate-700"}`}
                >
                  {t.label}
                  {"count" in t && t.count !== undefined && (
                    <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-100 px-1 text-[11px] font-semibold leading-none text-violet-700">{t.count}</span>
                  )}
                  {activeTab === t.label && <span className="absolute bottom-0 left-0 h-[2px] w-full bg-violet-600" />}
                </button>
              ))}
            </div>

            <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-[#cad5e2] bg-white">
              {/* Sticky header row */}
              <div className="flex shrink-0 border-b border-[#cad5e2]">
                <HeaderCell className="w-[148px] shrink-0">Task Number</HeaderCell>
                <HeaderCell className="w-[250px] shrink-0">Issue</HeaderCell>
                <HeaderCell className="w-[140px] shrink-0">Status</HeaderCell>
                <HeaderCell className="w-[208px] shrink-0">SLA</HeaderCell>
                <HeaderCell className="w-[110px] shrink-0">Priority</HeaderCell>
                <HeaderCell className="w-[260px] shrink-0">Assignee</HeaderCell>
                <HeaderCell className="min-w-[260px] flex-1">Building</HeaderCell>
                <div className="w-[60px] shrink-0 border-l border-[#cad5e2]" />
              </div>

              {/* Scrollable body */}
              <div
                ref={scrollRef}
                className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-[15px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <div className="flex">
                  <div className="w-[148px] shrink-0">
                    {TASKS.map((row) => (
                      <div key={row.id + "-num"} className="flex h-[60px] items-center gap-3 border-b border-[#cad5e2] px-4 last:border-b-0">
                        <span className="flex-1 truncate text-[14px] font-normal text-slate-700">{row.id}</span>
                        <button className="text-slate-500 hover:text-slate-700" aria-label="Copy task number">
                          <Copy className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="w-[250px] shrink-0">
                    {TASKS.map((row) => (
                      <div key={row.id + "-issue"} className="flex h-[60px] items-center border-b border-[#cad5e2] px-4 last:border-b-0">
                        <span className="truncate text-[14px] font-normal text-slate-700">{row.title}</span>
                      </div>
                    ))}
                  </div>

                  <div className="w-[140px] shrink-0">
                    {TASKS.map((row) => (
                      <div key={row.id + "-status"} className="flex h-[60px] items-center border-b border-[#cad5e2] px-4 last:border-b-0">
                        <StatusPill status={row.status} />
                      </div>
                    ))}
                  </div>

                  <div className="w-[208px] shrink-0">
                    {TASKS.map((row) => (
                      <SlaCell key={row.id + "-sla"} sla={row.sla} />
                    ))}
                  </div>

                  <div className="w-[110px] shrink-0">
                    {TASKS.map((row) => (
                      <div key={row.id + "-prio"} className="flex h-[60px] items-center border-b border-[#cad5e2] px-4 last:border-b-0">
                        <PriorityBadge p={row.priority} />
                      </div>
                    ))}
                  </div>

                  <div className="w-[260px] shrink-0">
                    {TASKS.map((row) => (
                      <Assignee key={row.id + "-asg"} items={row.assignees} />
                    ))}
                  </div>

                  <div className="min-w-[260px] flex-1">
                    {TASKS.map((row) => (
                      <Building key={row.id + "-bld"} name={row.building.name} location={row.building.location} image={row.building.image} />
                    ))}
                  </div>

                  {/* Sticky-right More column (inside scroll, sticky to right edge) */}
                  <div className="sticky right-0 z-20 w-[60px] shrink-0 border-l border-[#cad5e2] bg-white">
                    {TASKS.map((row) => (
                      <div key={row.id + "-more"} className="flex h-[60px] items-center justify-center border-b border-[#cad5e2] px-5 last:border-b-0">
                        <button className="rounded-md p-1 text-slate-500 hover:bg-slate-50 hover:text-slate-700" aria-label="Row actions">
                          <MoreVertical className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom vertical scrollbar — top z-index, sits above the scroll area, above the footer line */}
              <div
                aria-hidden
                className="pointer-events-none absolute right-0 top-12 z-50 w-[15px] border-l border-t border-[#cad5e2] bg-slate-50"
                style={{ bottom: 52 }}
              >
                {scrollMetrics.hasOverflow && (
                  <div
                    className="w-[7px] rounded bg-[#cad5e2]"
                    style={{ height: scrollMetrics.thumbHeight, transform: `translateY(${scrollMetrics.thumbTop}px)`, marginLeft: 4 }}
                  />
                )}
              </div>

              {/* Sticky footer — 52px tall, top z-index */}
              <div className="z-40 flex h-[52px] shrink-0 items-center border-t border-[#cad5e2] bg-white px-4 text-xs font-medium text-slate-500">Total results 17</div>
            </div>
          </div>
        </main>

        {/* Agent Chat sidebar — reuses Thinking, StreamingText, PromptBar */}
        <aside className="flex w-[500px] shrink-0 flex-col border-l border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div className="flex items-center gap-2.5">
              <Sparkle className="size-4 text-violet-600" fill="none" />
              <h2 className="text-[15.75px] font-medium leading-[162.5%] text-slate-900">Agent Chat</h2>
            </div>
            <button className="text-slate-500 hover:text-slate-700" aria-label="More">
              <MoreVertical className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-9 space-y-9">
            {chatTurns.map((t) => (
              <div key={t.id} className="flex flex-col gap-3">
                <div className="self-end max-w-[78%] rounded-2xl rounded-br-md bg-violet-100 px-4 py-2.5 text-sm text-violet-950">{t.user}</div>
                <Thinking done={t.done} onDone={() => onThinkingDone(t.id)} />
                {t.done && <div className="w-full"><StreamingText text={REPLY} /></div>}
              </div>
            ))}
          </div>

          <div className="shrink-0 flex justify-center bg-white px-4 pb-6">
            <PromptBar onSend={send} isThinking={isThinking} />
          </div>
        </aside>
      </div>
    </div>
  )
}
