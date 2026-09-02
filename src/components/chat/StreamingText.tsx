import { useEffect, useRef, useState } from "react"
export function StreamingText({ text, speed = 20, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const words = text.split(" ")
  const [n, setN] = useState(0)
  const anchorRef = useRef<HTMLSpanElement>(null)
  useEffect(() => { setN(0) }, [text])
  useEffect(() => {
    if (n < words.length) {
      const t = setTimeout(() => setN(v=>v+1), speed)
      return () => clearTimeout(t)
    } else {
      onDone?.()
    }
  }, [n, words.length, speed])
  // Auto-scroll ke bawah tiap kata baru muncul — cari scroll container terdekat lalu scroll smooth
  useEffect(() => {
    if (n === 0) return
    const el = anchorRef.current
    if (!el) return
    // cari parent yang scrollable (overflow-y-auto)
    let parent: HTMLElement | null = el.parentElement
    while (parent) {
      const style = getComputedStyle(parent)
      if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) break
      parent = parent.parentElement
    }
    if (parent) parent.scrollTo({ top: parent.scrollHeight, behavior: "smooth" })
    else el.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [n])
  return <p className="text-sm leading-relaxed text-gray-800">{words.slice(0,n).join(" ")}{n < words.length && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-primary animate-pulse" />}<span ref={anchorRef} aria-hidden /></p>
}
