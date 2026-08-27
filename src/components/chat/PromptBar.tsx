import { useRef, useLayoutEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Paperclip, Mic, Square } from "lucide-react"
import { BorderBeam } from "border-beam"

export function PromptBar({ onSend, isThinking }: { onSend: (t: string) => void; isThinking?: boolean }) {
  const [draft, setDraft] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)
  const canSend = !isThinking && draft.trim().length > 0
  const send = () => { if (!canSend || isThinking) return; onSend(draft.trim()); setDraft("") }

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = Math.min(el.scrollHeight, 6 * 24) + "px"
  }, [draft])

  const inner = (
    <div className="w-full max-w-2xl rounded-[20px] border border-border/15 bg-card p-2 shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex flex-col">
      <textarea
        ref={ref}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (isThinking) { if (e.key === "Enter" && !e.shiftKey) e.preventDefault(); return } if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
        placeholder="Ask anything..."
        rows={1}
        className="min-h-12 max-h-[144px] w-full resize-none bg-transparent px-3 py-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/20 hover:[&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-track]:bg-transparent"
      />
      <div className="flex shrink-0 items-center justify-between pt-1">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground/60 hover:text-muted-foreground"><Paperclip className="size-4" /></Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground/60 hover:text-muted-foreground"><Mic className="size-4" /></Button>
          {isThinking ? (
            <Button size="icon" variant="secondary" disabled className="size-8 rounded-full opacity-100"><Square className="size-3.5 fill-current" /></Button>
          ) : (
            <Button size="icon" disabled={!canSend} onClick={send} className="size-8 rounded-full"><ArrowUp className="size-4" /></Button>
          )}
        </div>
      </div>
    </div>
  )

  if (isThinking) {
    return (
      <BorderBeam size="md" colorVariant="ocean" className="w-full max-w-2xl">
        {inner}
      </BorderBeam>
    )
  }

  return inner
}
