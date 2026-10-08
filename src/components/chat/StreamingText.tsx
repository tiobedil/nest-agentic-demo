import { useEffect, useLayoutEffect, useRef, useState } from "react"

type StreamingTextProps = { text: string; speed?: number; onDone?: () => void; autoScroll?: boolean }

function TextStream({ text, speed = 20, onDone, autoScroll = true }: StreamingTextProps) {
  const words = text.split(" ")
  const [n, setN] = useState(0)
  const anchorRef = useRef<HTMLSpanElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const word = wordRef.current
    const cursor = cursorRef.current
    if (!word || !cursor) return
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const y = word.offsetTop + (word.offsetHeight - cursor.offsetHeight) / 2
    const start = `translate3d(${word.offsetLeft}px, ${y}px, 0)`
    const end = `translate3d(${word.offsetLeft + word.offsetWidth}px, ${y}px, 0)`
    cursor.style.transform = end
    cursor.style.opacity = "1"
    if (reducedMotion) {
      if (n === words.length) cursor.style.opacity = "0"
      return
    }
    const options = { duration: speed, easing: getComputedStyle(cursor).getPropertyValue("--ease-out").trim() }
    const reveal = word.animate([{ clipPath: "inset(0 100% 0 0)", opacity: 0 }, { clipPath: "inset(0 0% 0 0)", opacity: 1 }], options)
    const sweep = cursor.animate([{ transform: start }, { transform: end }], options)
    sweep.onfinish = () => { if (n === words.length) cursor.style.opacity = "0" }
    return () => { reveal.cancel(); sweep.cancel() }
  }, [n, speed, words.length])
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

  return <p className="relative text-sm leading-relaxed text-slate-800">{words.slice(0, n).map((word, index) => <span key={index}>{index > 0 ? " " : ""}<span ref={index === n - 1 ? wordRef : undefined} className="streaming-word">{word}</span></span>)}<span ref={anchorRef} aria-hidden="true" className="inline-block h-4 w-0 align-middle" /><span ref={cursorRef} aria-hidden="true" className="streaming-cursor pointer-events-none absolute top-0 left-0 h-4 w-0.5 bg-primary" /></p>
}

export function StreamingText(props: StreamingTextProps) {
  return <TextStream key={props.text} {...props} />
}
