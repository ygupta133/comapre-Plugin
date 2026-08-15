import { useState, useEffect } from 'react'

export default function TypingHeadline({ headline, highlight, className = '' }) {
  const fullText = `${headline} ${highlight}`.trim()
  const highlightStart = headline.length + (highlight ? 1 : 0)
  const [charIndex, setCharIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    setCharIndex(0)
  }, [fullText])

  useEffect(() => {
    if (charIndex >= fullText.length) return undefined
    const timer = setTimeout(() => setCharIndex((n) => n + 1), 45)
    return () => clearTimeout(timer)
  }, [charIndex, fullText])

  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 530)
    return () => clearInterval(blink)
  }, [])

  const before = fullText.slice(0, Math.min(charIndex, highlightStart))
  const highlightPart = highlight
    ? fullText.slice(highlightStart, charIndex)
    : ''

  return (
    <h1 className={`text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-5xl font-bold text-gray-900 leading-[1.15] mb-4 ${className}`}>
      {before}
      {highlightPart ? <span className="text-brand">{highlightPart}</span> : null}
      <span
        className={`inline-block w-[3px] h-[0.9em] bg-brand ml-1 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        aria-hidden="true"
      />
    </h1>
  )
}
