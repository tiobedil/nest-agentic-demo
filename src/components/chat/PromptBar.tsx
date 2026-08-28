import { useRef, useLayoutEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, Paperclip, Mic, Square } from "lucide-react"
import { BorderBeam } from "border-beam"

export function PromptBar({ onSend, isThinking }: { onSend: (t: string) => void; isThinking?: boolean }) {
  const [draft, setDraft] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)
  const canSend = !isThinking && draft.trim().length > 0
  const send = () => { if (!canSend || isThinking) return; onSend(draft.trim()); setDraft("") }

  const scrollTopRef = useRef(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => { if (draft) scrollTopRef.current = el.scrollTop }
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [draft])

  const prevDraftLen = useRef(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const wasAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
    const grew = draft.length > prevDraftLen.current
    prevDraftLen.current = draft.length
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 6 * 24) + "px"
    if (draft) {
      // When typing new rows that make it scrollable, stick to bottom
      if (grew && wasAtBottom) {
        el.scrollTop = el.scrollHeight
        scrollTopRef.current = el.scrollTop
      } else {
        el.scrollTop = scrollTopRef.current
        requestAnimationFrame(() => { if (ref.current && draft) ref.current.scrollTop = scrollTopRef.current })
      }
    }
  }, [draft, isThinking])

  const innerShadow = "shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)
  const [isScrollable, setIsScrollable] = useState(false)

  // update fade/scrollbar visibility based on scroll
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const scrollable = el.scrollHeight > el.clientHeight + 1
      setIsScrollable(scrollable)
      setShowTopFade(el.scrollTop > 4)
      setShowBottomFade(el.scrollTop + el.clientHeight < el.scrollHeight - 4)
    }
    update()
    el.addEventListener("scroll", update)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener("scroll", update); ro.disconnect() }
  }, [draft])

  // Keep textarea mounted across isThinking toggles — wrapping with BorderBeam
  // conditionally remounted the textarea and lost height/scroll/fade state.
  // Use a single wrapper and overlay the beam when thinking.
  const content = (
    <>
      <div className="relative flex flex-col">
        <textarea
          ref={ref}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (isThinking) { if (e.key === "Enter" && !e.shiftKey) e.preventDefault(); return } if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask anything..."
          rows={1}
          className={`min-h-[54px] max-h-[144px] w-full resize-none bg-transparent px-3.5 py-3.5 text-[15.5px] leading-[1.625] outline-none placeholder:text-muted-foreground/50 ${isScrollable ? "overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/20 hover:[&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-track]:bg-transparent" : "overflow-hidden [&::-webkit-scrollbar]:hidden"}`}
          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
        />
        {showTopFade && <div className="pointer-events-none absolute left-0 right-2 top-0 h-6 bg-gradient-to-b from-white to-transparent" />}
        {showBottomFade && <div className="pointer-events-none absolute left-0 right-2 bottom-0 h-6 bg-gradient-to-t from-white to-transparent" />}
      </div>
      <div className="flex shrink-0 items-center justify-between bg-white pt-1">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground/60 hover:text-muted-foreground"><Paperclip className="size-[18px]" /></Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground/60 hover:text-muted-foreground"><Mic className="size-[18px]" /></Button>
          {isThinking ? (
            <Button size="icon" variant="secondary" disabled className="size-9 rounded-full border border-border/15 opacity-100"><Square className="size-3.5 fill-current" /></Button>
          ) : (
            <Button size="icon" disabled={!canSend} onClick={send} className={`size-9 rounded-full text-white ${canSend ? "bg-[oklch(60.6%_0.25_292.7)] hover:bg-[oklch(56%_0.25_292.7)]" : "bg-[#E8E8EC] text-white !opacity-100 hover:bg-[#E8E8EC]"}`}><ArrowUp className="size-[18px]" /></Button>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className={`relative w-full max-w-2xl rounded-[20px] border border-[#2E303A14] bg-white flex flex-col overflow-clip px-2 pt-2 pb-2 ${innerShadow}`}>
      {isThinking && (
        <div className="pointer-events-none absolute inset-0 rounded-[20px] overflow-hidden">
          <BorderBeam size="md" colorVariant="ocean" className="w-full h-full" style={{ borderRadius: 20 } as React.CSSProperties}>
            <div className="w-full h-full" />
          </BorderBeam>
        </div>
      )}
      {content}
    </div>
  )
}
