import { Agentation } from "agentation"
import { useEffect, useRef, useState } from "react"
import { PromptBar } from "@/components/chat/PromptBar"
import { Thinking } from "@/components/chat/Thinking"
import { StreamingText } from "@/components/chat/StreamingText"
type Msg = { id: string; role: "user" | "assistant"; text: string }
const REPLY = "This is a mock reply returned for every message to verify the chat flow. The assistant first shows a Thinking state for about six seconds, then streams this paragraph as if it were generated live. In a real implementation this content would be replaced by an LLM response, with support for markdown, code blocks, and follow up actions. For now the text is intentionally longer so you can judge line height, wrapping, and readability in the final layout."

export default function App() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [pending, setPending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasChat = msgs.length > 0 || pending
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs, pending])
  const send = (t: string) => { setMsgs(m => [...m, { id: Date.now().toString(), role: "user", text: t }]); setPending(true) }
  const onDone = () => { setPending(false); setMsgs(m => [...m, { id: (Date.now()+1).toString(), role: "assistant", text: REPLY }]) }

  return (
    <div className="flex h-dvh flex-col bg-white">
      <div className="flex-1 overflow-y-auto bg-white">
        {!hasChat ? (
          <div className="flex h-full items-start justify-center p-6 pt-[240px] bg-white">
            <div className="w-full max-w-2xl flex flex-col items-center gap-8">
              <div className="text-center space-y-2">
                <h2 className="text-[36px] font-semibold tracking-tight text-foreground/80 leading-none">How can I help you today?</h2>
                <p className="text-sm text-muted-foreground">Start a conversation. The assistant replies with the same message for now.</p>
              </div>
              <PromptBar onSend={send} />
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl px-4 py-8 flex flex-col gap-5">
            {msgs.map(m => m.role === "user" ? (
              <div key={m.id} className="self-end max-w-[78%] rounded-2xl rounded-br-md bg-violet-100 px-4 py-2.5 text-sm text-violet-950">{m.text}</div>
            ) : (
              <div key={m.id} className="self-start w-full"><StreamingText text={m.text} /></div>
            ))}
            {pending && <Thinking onDone={onDone} />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {hasChat && (
        <div className="shrink-0 flex justify-center p-4 pb-6">
          <PromptBar onSend={send} />
        </div>
      )}
      <Agentation />
    </div>
  )
}
