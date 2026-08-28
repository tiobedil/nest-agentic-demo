import { useEffect, useState } from "react"
export function StreamingText({ text, speed = 20 }: { text: string; speed?: number }) {
  const words = text.split(" ")
  const [n, setN] = useState(0)
  useEffect(() => { setN(0) }, [text])
  useEffect(() => { if (n < words.length) { const t = setTimeout(() => setN(v=>v+1), speed); return () => clearTimeout(t) } }, [n, words.length, speed])
  return <p className="text-sm leading-relaxed text-gray-800">{words.slice(0,n).join(" ")}{n < words.length && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-primary animate-pulse" />}</p>
}
