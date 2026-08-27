import { useEffect, useState } from "react"
export function StreamingText({ text, speed = 16 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0)
  useEffect(() => { if (n < text.length) { const t = setTimeout(() => setN(v=>v+1), speed); return () => clearTimeout(t) } }, [n, text, speed])
  return <p className="text-sm leading-relaxed text-gray-800">{text.slice(0,n)}{n < text.length && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-gray-800 animate-pulse" />}</p>
}
