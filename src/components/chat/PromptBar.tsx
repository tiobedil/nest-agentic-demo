import { useRef, useLayoutEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Paperclip, Mic } from "lucide-react"

export function PromptBar({ onSend }: { onSend: (t: string) => void }) {
  const [draft, setDraft] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)
  const canSend = draft.trim().length > 0
  const send = () => { if (!canSend) return; onSend(draft.trim()); setDraft("") }

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = Math.min(el.scrollHeight, 6 * 24) + "px"
  }, [draft])

  return (
    <div className="w-full max-w-2xl rounded-[20px] border border-border/30 bg-card p-2 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex flex-col">
      <textarea
        ref={ref}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
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
          <Button size="icon" disabled={!canSend} onClick={send} className="size-8 rounded-full"><ArrowUp className="size-4" /></Button>
        </div>
      </div>
    </div>
  )
}
