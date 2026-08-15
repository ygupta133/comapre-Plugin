import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSiteBundle } from '../hooks/useSiteSettings'
import { useUserRegion, getRegionalContact } from '../hooks/useUserRegion'
import {
  defaultWelcome,
  quickReplies,
  findBotReply,
} from '../lib/chatbotKnowledge'

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      Y
    </div>
  )
}

export default function ChatBot({ open, onClose }) {
  const { settings } = useSiteBundle()
  const region = useUserRegion()
  const contact = getRegionalContact(settings, region)
  const welcome = settings.chatWelcome || defaultWelcome

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ from: 'bot', text: welcome }])
    }
  }, [open, welcome, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { from: 'user', text: trimmed }])
    setInput('')
    setTimeout(() => {
      const reply = findBotReply(trimmed)
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: reply.answer, action: reply.action },
      ])
    }, 400)
  }

  const waText = encodeURIComponent(
    settings.whatsappMessage || 'Hi Yogesh, I found your website and would like to discuss a project.',
  )
  const waLink = `${contact.whatsapp}${contact.whatsapp.includes('?') ? '&' : '?'}text=${waText}`

  if (!open) return null

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[380px] max-h-[min(520px,70vh)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-up">
      <div className="bg-brand text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BotAvatar />
          <div>
            <p className="font-semibold text-sm leading-tight">Chat with Yogesh</p>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className="w-2 h-2 bg-brand-light rounded-full animate-pulse" />
              Online — replies in ~24h
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white text-xl leading-none p-1"
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-600 flex items-center gap-2">
        <span>{contact.flag}</span>
        <span>
          {contact.label}:{' '}
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-brand font-medium hover:underline">
            {contact.phone}
          </a>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.from === 'bot' && <BotAvatar />}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.from === 'user'
                  ? 'bg-brand text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {msg.text}
              {msg.action && (
                <div className="mt-2">
                  {msg.action.external ? (
                    <a
                      href={settings.upworkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-semibold text-brand bg-white px-3 py-1.5 rounded-full hover:bg-brand/10"
                    >
                      {msg.action.label}
                    </a>
                  ) : msg.action.href ? (
                    <Link
                      to={msg.action.href}
                      onClick={onClose}
                      className="inline-block text-xs font-semibold text-brand bg-white px-3 py-1.5 rounded-full hover:bg-brand/10"
                    >
                      {msg.action.label}
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendMessage(q)}
              className="text-xs bg-brand/8 text-brand border border-brand/20 px-2.5 py-1 rounded-full hover:bg-brand/15 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-gray-100 space-y-2">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp — Quick Reply
        </a>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about services, pricing..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30"
          />
          <button
            type="submit"
            className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
