import { useEffect, useRef, useState } from "react"
import { PromptBar } from "@/components/chat/PromptBar"
import { Processing } from "@/components/chat/Processing"
import { StreamingText } from "@/components/chat/StreamingText"
import { SelectableReservationCard } from "@/components/ReservationSummary"
import { ExtensionDateField } from "@/components/ExtensionDateField"

type Turn = { id: string; user: string; done: boolean; streamed: boolean; loaded: boolean; selectedId: string | null; extensionDate: Date | null }

const STREAMING_REPLY = "Found three active reservations for Amar. Select the one you'd like to continue with the extension request."

const RESERVATIONS = [
  {
    id: "D-15202023",
    guests: 2,
    property: "DXB-LANA-SA-101",
    checkInDate: "November 10th, 2024",
    checkInTime: "12:00 PM",
    checkOutDate: "November 15th, 2024",
    checkOutTime: "14:00 PM",
  },
  {
    id: "D-15202024",
    guests: 3,
    property: "DXB-MARINA-PH-202",
    checkInDate: "November 18th, 2024",
    checkInTime: "10:00 AM",
    checkOutDate: "November 22nd, 2024",
    checkOutTime: "11:00 AM",
  },
  {
    id: "D-15202025",
    guests: 1,
    property: "DXB-DOWNTOWN-BL-303",
    checkInDate: "December 1st, 2024",
    checkInTime: "03:00 PM",
    checkOutDate: "December 5th, 2024",
    checkOutTime: "12:00 PM",
  },
] as const

function FadeScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const update = () => {
    const el = ref.current
    if (!el) return
    setShowLeft(el.scrollLeft > 4)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }
  useEffect(() => {
    update()
    const el = ref.current
    if (!el) return
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener("resize", update)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])
  useEffect(() => {
    update()
  })
  return (
    <div className="relative">
      <div ref={ref} className="flex gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory" style={{ gap: "12px" }}>
        {children}
      </div>
      {showLeft && <div className="pointer-events-none absolute bottom-2 left-0 top-1 w-6 bg-gradient-to-r from-white to-transparent" />}
      {showRight && <div className="pointer-events-none absolute bottom-2 right-0 top-1 w-6 bg-gradient-to-l from-white to-transparent" />}
    </div>
  )
}

const SelectableSkeleton = () => (
  <FadeScrollRow>
    {[0, 1, 2].map(i => (
      <div key={i} className="flex w-[300px] shrink-0 snap-start flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
        <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-px bg-slate-200" />
        <div className="flex gap-4">
          {[0, 1].map(j => (
            <div key={j} className="flex flex-1 flex-col gap-2">
              <div className="h-2 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </FadeScrollRow>
)

export function PgAgent2() {
  const [turns, setTurns] = useState<Turn[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasChat = turns.length > 0
  const isThinking = turns.some(t => !t.loaded)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [turns])

  const send = (t: string) => {
    setTurns(m => [...m, { id: Date.now().toString(), user: t, done: false, streamed: false, loaded: false, selectedId: null, extensionDate: null }])
  }

  const onProcessingDone = (id: string) => {
    setTurns(m => m.map(t => (t.id === id ? { ...t, done: true } : t)))
  }

  const onStreamDone = (id: string) => {
    setTurns(m => m.map(t => (t.id === id ? { ...t, streamed: true } : t)))
    setTimeout(() => {
      setTurns(m => m.map(t => (t.id === id ? { ...t, loaded: true } : t)))
    }, 700)
  }

  const selectReservation = (turnId: string, reservationId: string) => {
    setTurns(m => m.map(t => (t.id === turnId ? { ...t, selectedId: reservationId } : t)))
  }

  const setExtensionDate = (turnId: string, date: Date | undefined) => {
    setTurns(m => m.map(t => (t.id === turnId ? { ...t, extensionDate: date ?? null } : t)))
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto bg-white">
        {!hasChat ? (
          <div className="flex h-full items-start justify-center bg-white p-6 pt-[240px]">
            <div className="flex w-full max-w-2xl flex-col items-center gap-8">
              <div className="space-y-4 text-center">
                <h2 className="text-[36px] font-semibold leading-none tracking-tight text-foreground/80">How can I help you today?</h2>
                <p className="text-sm text-muted-foreground">Start a conversation. The assistant replies with the same message for now.</p>
              </div>
              <PromptBar onSend={send} isThinking={isThinking} />
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8">
            {turns.map(t => (
              <div key={t.id} className="flex flex-col gap-8">
                <div className="self-end max-w-[78%] rounded-2xl rounded-br-[6px] bg-violet-100 px-4 py-2.5 text-sm text-violet-950">{t.user}</div>
                <div className="flex flex-col gap-[12px]">
                  <Processing done={t.done} onDone={() => onProcessingDone(t.id)} title="Finding reservation based on the query" doneTitle="Finding for ~1 second" hideSteps stages={[1500]} />
                  {t.done && (
                    <div className="flex flex-col gap-[12px]">
                      <StreamingText text={STREAMING_REPLY} speed={18} onDone={() => onStreamDone(t.id)} />
                      {t.streamed && !t.loaded && <SelectableSkeleton />}
                      {t.loaded && (
                        <div className="flex flex-col gap-4">
                          <FadeScrollRow>
                            {RESERVATIONS.map(r => (
                              <SelectableReservationCard
                                key={r.id}
                                name="Amar Sundaram"
                                email="amar.sundaram@example.com"
                                phone="+226-795-552-31"
                                reservationId={r.id}
                                checkInDate={r.checkInDate}
                                checkInTime={r.checkInTime}
                                checkOutDate={r.checkOutDate}
                                checkOutTime={r.checkOutTime}
                                property={r.property}
                                guests={r.guests}
                                selected={t.selectedId === r.id}
                                onSelect={() => selectReservation(t.id, r.id)}
                              />
                            ))}
                          </FadeScrollRow>
                          <ExtensionDateField
                            value={t.extensionDate ?? undefined}
                            onChange={d => setExtensionDate(t.id, d)}
                            label="New check-out date"
                            placeholder="Select new check-out date"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {hasChat && (
        <div className="flex shrink-0 justify-center px-4 pb-6">
          <PromptBar onSend={send} isThinking={isThinking} />
        </div>
      )}
    </div>
  )
}
