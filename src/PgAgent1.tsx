import { useEffect, useRef, useState } from "react"
import { PromptBar } from "@/components/chat/PromptBar"
import { Processing } from "@/components/chat/Processing"
import { StreamingText } from "@/components/chat/StreamingText"
import { ReservationSummary } from "@/components/ReservationSummary"

type Turn = { id: string; user: string; done: boolean; streamed: boolean; loaded: boolean }

const STREAMING_REPLY =
  "Your AI agent has found an active reservation from Amar Sundaram. Here are the details below."

const ReservationSkeleton = () => (
  <div
    aria-hidden
    className="flex w-full flex-col gap-4 rounded-xl border border-slate-300 bg-white p-4 font-sans text-sm text-slate-700"
  >
    <div className="flex w-full items-start gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="size-10 shrink-0 animate-pulse rounded-full bg-slate-200" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_0_0] flex-row gap-2 rounded-lg bg-slate-50 p-2">
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
    <div className="h-px w-full bg-slate-300" />
    <div className="flex w-full items-start gap-4">
      {[0, 1, 2].map(i => (
        <div key={i} className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  </div>
)

export function PgAgent1() {
  const [turns, setTurns] = useState<Turn[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasChat = turns.length > 0
  const isThinking = turns.some(t => !t.done)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [turns])

  const send = (t: string) => {
    setTurns(m => [...m, { id: Date.now().toString(), user: t, done: false, streamed: false, loaded: false }])
  }

  const onProcessingDone = (id: string) => {
    setTurns(m => m.map(t => t.id === id ? { ...t, done: true } : t))
  }

  const onStreamDone = (id: string) => {
    setTurns(m => m.map(t => t.id === id ? { ...t, streamed: true } : t))
    setTimeout(() => {
      setTurns(m => m.map(t => t.id === id ? { ...t, loaded: true } : t))
    }, 700)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto bg-white">
        {!hasChat ? (
          <div className="flex h-full items-start justify-center p-6 pt-[240px] bg-white">
            <div className="w-full max-w-2xl flex flex-col items-center gap-8">
              <div className="text-center space-y-4">
                <h2 className="text-[36px] font-semibold tracking-tight text-foreground/80 leading-none">How can I help you today?</h2>
                <p className="text-sm text-muted-foreground">Start a conversation. The assistant replies with the same message for now.</p>
              </div>
                <PromptBar onSend={send} isThinking={isThinking} />
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-8">
            {turns.map(t => (
              <div key={t.id} className="flex flex-col gap-8">
                <div className="self-end max-w-[78%] rounded-2xl rounded-br-[6px] bg-violet-100 px-4 py-2.5 text-sm text-violet-950">{t.user}</div>
                <div className="flex flex-col gap-[12px]">
                  <Processing done={t.done} onDone={() => onProcessingDone(t.id)} />
                  {t.done && (
                    <div className="flex flex-col gap-[12px]">
                      <StreamingText
                        text={STREAMING_REPLY}
                        speed={18}
                        onDone={() => onStreamDone(t.id)}
                      />
                      {t.streamed && !t.loaded && <ReservationSkeleton />}
                      {t.loaded && (
                        <ReservationSummary
                          name="Amar Sundaram"
                          email="amar.sundaram@example.com"
                          phone="+226-795-552-31"
                          reservationId="D-15202023"
                          checkInDate="November 10th, 2024"
                          checkInTime="12:00 PM"
                          checkOutDate="November 15th, 2024"
                          checkOutTime="14:00 PM"
                          property="DXB-LANA-SA-101"
                          guests={2}
                        />
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
        <div className="shrink-0 flex justify-center px-4 pb-6">
          <PromptBar onSend={send} isThinking={isThinking} />
        </div>
      )}
    </div>
  )
}