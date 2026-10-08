import { useEffect, useRef, useState } from "react"

type StreamingTextProps = { text: string; speed?: number; onDone?: () => void; autoScroll?: boolean }

function TextStream({ text, speed = 20, onDone, autoScroll = true }: StreamingTextProps) {
  const words = text.split(" ")
  const [n, setN] = useState(0)
  const anchorRef = useRef<HTMLSpanElement>(null)
  const onDoneRef = useRef(onDone)
  const completedRef = useRef(false)

  useEffect(() => { onDoneRef.current = onDone }, [onDone])
  useEffect(() => {
    if (n < words.length) {
      const timer = window.setTimeout(() => setN(value => value + 1), speed)
      return () => window.clearTimeout(timer)
    }
    if (!completedRef.current) {
      completedRef.current = true
      onDoneRef.current?.()
    }
  }, [n, words.length, speed])

  useEffect(() => {
    if (n === 0 || !autoScroll) return
    const el = anchorRef.current
    if (!el) return
    let parent: HTMLElement | null = el.parentElement
    while (parent) {
      const style = getComputedStyle(parent)
      if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) break
      parent = parent.parentElement
    }
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    if (parent) parent.scrollTo({ top: parent.scrollHeight, behavior })
    else el.scrollIntoView({ behavior, block: "end" })
  }, [n, autoScroll])

  return <p className="text-sm leading-relaxed text-slate-800">{words.slice(0, n).map((word, index) => <span key={index} className="streaming-word">{index > 0 ? " " : ""}{word}</span>)}{n < words.length && <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-primary motion-safe:animate-pulse" />}<span ref={anchorRef} aria-hidden="true" /></p>
}

export function StreamingText(props: StreamingTextProps) {
  return <TextStream key={props.text} {...props} />
}
