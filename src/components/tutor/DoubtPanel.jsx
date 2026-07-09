import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User, Sparkles } from 'lucide-react'

export default function DoubtPanel({ open, onClose, onAsk, currentSection }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) {
      setMessages([{
        role: 'bot',
        text: `Ask me anything about this topic! I'll explain while keeping the lesson context.`
      }])
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setQuestion('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)
    const result = await onAsk(q)
    setLoading(false)
    if (result?.answer) {
      setMessages(prev => [...prev, { role: 'bot', text: result.answer }])
    } else {
      setMessages(prev => [...prev, { role: 'bot', text: 'Could not answer. Please try rephrasing.' }])
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-[#1a1a2e]/95 backdrop-blur-xl border-l border-white/10 flex flex-col z-20"
        >
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-sm font-semibold text-white">Ask a Doubt</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer border-0 bg-transparent">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={12} className="text-purple-400" />
                  </div>
                )}
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-500/20 text-purple-100 rounded-tr-sm'
                    : 'bg-white/5 text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={12} className="text-cyan-400" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Bot size={12} className="text-purple-400" />
                </div>
                <div className="px-3 py-2 rounded-xl bg-white/5 text-sm text-gray-400">
                  <span className="flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }}}
                placeholder="Type your doubt..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors"
              />
              <button onClick={handleSend} disabled={!question.trim() || loading}
                className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-all disabled:opacity-30 cursor-pointer border-0">
                <Send size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
