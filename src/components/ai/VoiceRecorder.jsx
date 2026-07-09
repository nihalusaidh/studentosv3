import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Sparkles, RefreshCw, Copy, Check, Save, Clock, Trash2, ChevronDown, ChevronUp, FileText, BookOpen, List, MessageSquare } from 'lucide-react'
import { callGemini } from '../../config/gemini'
import { useAuth } from '../../contexts/AuthContext'
import { checkAiAccess, deductToken } from '../../utils/aiAccess'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import ToolGuide from './ToolGuide'
import { isSpeechSupported, createRecognizer, getSupportedLanguages } from '../../utils/speechUtils'
import { getRecordings, saveRecording, deleteRecording } from '../../utils/voiceStorage'
import toast from 'react-hot-toast'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
}

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function VoiceRecorder() {
  const [status, setStatus] = useState('idle') // idle | recording | stopped | generating | done
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [notes, setNotes] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')
  const [isDemo, setIsDemo] = useState(false)
  const [lang, setLang] = useState('en-US')
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [title, setTitle] = useState('')

  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const timerRef = useRef(null)
  const audioChunksRef = useRef([])

  const { user, profile } = useAuth()

  useEffect(() => {
    setRecordings(getRecordings())
  }, [])

  const cleanup = useCallback(() => {
    recognitionRef.current?.abort()
    recognitionRef.current = null
    timerRef.current && clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const startRecording = async () => {
    setError('')
    setTranscript('')
    setInterimTranscript('')
    setElapsed(0)
    setNotes(null)
    setIsDemo(false)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      audioChunksRef.current = []
      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' })
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      recorder.start(1000)
      mediaRecorderRef.current = recorder

      if (isSpeechSupported()) {
        const recognition = createRecognizer(lang)
        if (recognition) {
          recognition.onresult = (e) => {
            let final = ''
            let interim = ''
            for (let i = e.resultIndex; i < e.results.length; i++) {
              if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
              else interim += e.results[i][0].transcript
            }
            if (final) setTranscript(prev => prev + final)
            setInterimTranscript(interim)
          }
          recognition.onerror = () => {
            toast.error('Speech recognition error. Transcription may be incomplete.')
          }
          recognition.start()
          recognitionRef.current = recognition
        }
      }

      const startTime = Date.now()
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)

      setStatus('recording')
      toast.success('Recording started')
    } catch (e) {
      if (e.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone permissions in your browser settings.')
      } else {
        setError('Failed to access microphone. Ensure a microphone is connected.')
      }
    }
  }

  const stopRecording = () => {
    recognitionRef.current?.stop()
    mediaRecorderRef.current?.stop()
    timerRef.current && clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setInterimTranscript('')
    setStatus('stopped')
  }

  const discardRecording = () => {
    setStatus('idle')
    setTranscript('')
    setElapsed(0)
    setError('')
  }

  const handleGenerate = async () => {
    const text = transcript.trim()
    if (!text) return toast.error('No transcription to generate notes from')

    const access = checkAiAccess(profile)
    if (!access.allowed) {
      toast.error(access.needsUpgrade ? 'AI features require premium. Upgrade to continue.' : access.message)
      return
    }

    setStatus('generating')
    setIsDemo(false)
    setError('')

    try {
      const res = await callGemini(`Convert this lecture transcript into structured study notes.

Return ONLY valid JSON with no markdown formatting:
{
  "mainTopics": ["topic 1", "topic 2"],
  "keyPoints": ["key point 1", "key point 2"],
  "definitions": [{"term": "term", "definition": "definition"}],
  "summary": "2-3 sentence summary"
}

Transcript:
${text}`)

      if (res.text && !res.error) {
        try {
          const cleaned = res.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
          const parsed = JSON.parse(cleaned)
          if (parsed.mainTopics || parsed.keyPoints) {
            setIsDemo(!!res.demo)
            setNotes(parsed)
            setStatus('done')
            if (profile?.plan !== 'premium') await deductToken(user?.uid)
            return
          }
        } catch {}
      }

      const fallback = {
        mainTopics: ['Lecture Content'],
        keyPoints: [text.slice(0, 200) + '...'],
        definitions: [],
        summary: text.length > 100 ? text.slice(0, 300) + '...' : text
      }
      setIsDemo(true)
      setNotes(fallback)
      setStatus('done')
    } catch {
      setError('Failed to generate notes. Try again.')
      setStatus('stopped')
    }
  }

  const handleSave = () => {
    if (!title.trim()) { toast.error('Enter a title to save'); return }
    saveRecording({
      title: title.trim(),
      duration: elapsed,
      transcription: transcript,
      notes: notes ? JSON.stringify(notes) : ''
    })
    setRecordings(getRecordings())
    toast.success('Recording saved!')
  }

  const handleCopy = () => {
    const text = notes ? `${notes.mainTopics?.map(t => `• ${t}`).join('\n') || ''}\n\n${notes.keyPoints?.map(p => `• ${p}`).join('\n') || ''}\n\n${notes.summary || ''}` : transcript
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  const handleDelete = (id) => {
    deleteRecording(id)
    setRecordings(getRecordings())
    toast.success('Recording deleted')
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <ToolGuide
        steps={['Click "Start Recording" and grant microphone access', 'Speak clearly — your lecture audio is transcribed live', 'Click "Stop" when done', 'Review and edit the transcription', 'Click "Generate Notes" for AI-structured study notes', 'Save, copy, or download your notes']}
        tips={['Works best in Chrome/Edge with Speech Recognition', 'Supported languages: English, Hindi, Spanish, French, German, and more', 'Edit the transcription before generating for best results', 'Past recordings are saved locally for later reference']}
      />

      {/* Main recording UI */}
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div key="idle" variants={item} className="text-center py-6 space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 cursor-pointer border-0"
            >
              <Mic size={32} />
            </motion.button>
            <div>
              <p className="text-sm font-semibold text-primary">Start Recording</p>
              <p className="text-xs text-muted mt-1">Click the mic to begin transcribing your lecture</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <select value={lang} onChange={e => setLang(e.target.value)}
                className="text-xs bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 text-primary outline-none focus:border-[var(--accent)] cursor-pointer">
                {getSupportedLanguages().map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              {!isSpeechSupported() && (
                <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">Manual entry only</span>
              )}
            </div>
            {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
          </motion.div>
        )}

        {status === 'recording' && (
          <motion.div key="recording" variants={item} className="space-y-3">
            <div className="text-center space-y-2">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-red-500" />
              </motion.div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-bold text-primary tabular-nums">{formatTime(elapsed)}</span>
                <span className="text-[10px] text-muted bg-white/5 px-1.5 py-0.5 rounded-full">LIVE</span>
              </div>
              <button onClick={stopRecording}
                className="px-5 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all cursor-pointer border border-red-500/30 flex items-center gap-2 mx-auto">
                <Square size={14} /> Stop Recording
              </button>
            </div>
            <GlassCard className="p-3 max-h-40 overflow-y-auto">
              <p className="text-xs text-secondary whitespace-pre-wrap">
                {transcript}
                {interimTranscript && <span className="text-muted">{interimTranscript}</span>}
                {!transcript && !interimTranscript && <span className="text-muted italic">Listening...</span>}
              </p>
            </GlassCard>
          </motion.div>
        )}

        {(status === 'stopped' || status === 'generating') && (
          <motion.div key="stopped" variants={item} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-muted" />
                <span className="text-xs text-muted">{formatTime(elapsed)} recorded</span>
              </div>
              <div className="flex gap-2">
                {status === 'stopped' && (
                  <>
                    <button onClick={discardRecording}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted hover:text-primary text-xs transition-all cursor-pointer border-0">
                      Discard
                    </button>
                    <Button onClick={handleGenerate} icon={Sparkles} size="sm" loading={false}>Generate Notes</Button>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted mb-1 block font-medium">Transcription</label>
              <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
                rows={6}
                className="w-full rounded-xl px-3 py-2.5 text-sm bg-[var(--input-bg)] border border-[var(--border-color)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent)] resize-none transition-all duration-300"
                placeholder="Edit transcription if needed..."
                disabled={status === 'generating'}
              />
            </div>
            {status === 'generating' && (
              <GlassCard className="p-6 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                  <Sparkles size={28} className="text-[var(--accent)] mx-auto" />
                </motion.div>
                <p className="text-sm text-muted mt-3">Generating structured notes...</p>
              </GlassCard>
            )}
          </motion.div>
        )}

        {status === 'done' && notes && (
          <motion.div key="done" variants={item} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-purple-400" />
                <span className="text-sm font-semibold text-primary">Study Notes</span>
                {isDemo && <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/30">Demo</span>}
              </div>
              <div className="flex gap-1">
                <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-primary transition-all cursor-pointer border-0 bg-transparent" title="Copy">
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <GlassCard className="p-4 space-y-3">
              {notes.mainTopics?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BookOpen size={12} className="text-purple-400" />
                    <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Main Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {notes.mainTopics.map((t, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {notes.keyPoints?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <List size={12} className="text-cyan-400" />
                    <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Key Points</span>
                  </div>
                  <div className="space-y-1">
                    {notes.keyPoints.map((p, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 text-xs mt-0.5">•</span>
                        <span className="text-xs text-secondary">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {notes.definitions?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquare size={12} className="text-amber-400" />
                    <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Definitions</span>
                  </div>
                  <div className="space-y-1">
                    {notes.definitions.map((d, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-medium text-primary">{d.term}:</span>{' '}
                        <span className="text-secondary">{d.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {notes.summary && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageSquare size={12} className="text-green-400" />
                    <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Summary</span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">{notes.summary}</p>
                </div>
              )}
            </GlassCard>

            <div className="flex items-center gap-2">
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Enter a title to save..."
                className="flex-1 px-3 py-2 rounded-xl text-sm bg-[var(--input-bg)] border border-[var(--border-color)] text-primary placeholder:text-muted focus:outline-none focus:border-[var(--accent)]"
              />
              <Button onClick={handleSave} icon={Save} size="sm">Save</Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => { setStatus('idle'); setTranscript(''); setElapsed(0); setNotes(null); setTitle('') }} icon={RefreshCw} size="sm" className="flex-1">Record Again</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      <div>
        <button onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs cursor-pointer">
          <Clock size={14} className="text-muted" />
          <span className="font-medium text-secondary">Past Recordings</span>
          <span className="text-[10px] text-muted">({recordings.length})</span>
          <div className="ml-auto">{showHistory ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}</div>
        </button>
        <AnimatePresence>
          {showHistory && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {recordings.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">No recordings yet</p>
                ) : (
                  recordings.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-primary truncate">{r.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted">{formatTime(r.duration)}</span>
                          <span className="text-[10px] text-muted">{new Date(r.date).toLocaleDateString()}</span>
                          {r.notes && <span className="text-[10px] text-purple-400">Has notes</span>}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-all cursor-pointer border-0 bg-transparent shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
