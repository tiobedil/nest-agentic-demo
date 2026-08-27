import { Agentation } from "agentation"
import { useEffect, useRef, useState } from "react"
import { PromptBar } from "@/components/chat/PromptBar"
import { Thinking } from "@/components/chat/Thinking"
import { StreamingText } from "@/components/chat/StreamingText"
type Msg = { id: string; role: "user" | "assistant"; text: string }
type Turn = { id: string; user: string; reply?: string; done: boolean }
const REPLY = "This is a mock reply returned for every message to verify the chat flow. The assistant first shows a Thinking state for about six seconds, then streams this paragraph as if it were generated live. In a real implementation this content would be replaced by an LLM response, with support for markdown, code blocks, and follow up actions. For now the text is intentionally longer so you can judge line height, wrapping, and readability in the final layout."

export default function App() {
  const [turns, setTurns] = useState<Turn[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasChat = turns.length > 0
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [turns])
  const send = (t: string) => { setTurns(m => [...m, { id: Date.now().toString(), user: t, done: false }]) }
  const onDone = (id: string) => { setTurns(m => m.map(t => t.id === id ? { ...t, done: true, reply: REPLY } : t)) }

  return (
    <div className="flex h-dvh flex-col bg-white">
      <div className="flex-1 overflow-y-auto bg-white">
        {!hasChat ? (
          <div className="flex h-full items-start justify-center p-6 pt-[240px] bg-white">
            <div className="w-full max-w-2xl flex flex-col items-center gap-8">
              <div className="text-center space-y-4">
                <h2 className="text-[36px] font-semibold tracking-tight text-foreground/80 leading-none">How can I help you today?</h2>
                <p className="text-sm text-muted-foreground">Start a conversation. The assistant replies with the same message for now.</p>
              </div>
              <PromptBar onSend={send} />
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-5">
            {turns.map(t => (
              <div key={t.id} className="flex flex-col gap-3">
                <div className="self-end max-w-[78%] rounded-2xl rounded-br-[6px] bg-violet-100 px-4 py-2.5 text-sm text-violet-950">{t.user}</div>
                <Thinking done={t.done} onDone={() => onDone(t.id)} />
                {t.done && t.reply && <div className="self-start w-full"><StreamingText text={t.reply} /></div>}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {hasChat && (
        <div className="shrink-0 flex justify-center px-4 pb-6">
          <PromptBar onSend={send} />
        </div>
      )}
      <Agentation />
    </div>
  )
}
