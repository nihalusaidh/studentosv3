import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db } from '../config/firebase'
import { supabase } from '../config/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useXp } from '../contexts/XpContext'
import { usePremium } from '../contexts/PremiumContext'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Upload, Search, FileText, Download, Trash2, Edit3, AlertCircle, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NotesHub() {
  const { user } = useAuth()
  const { awardXp } = useXp()
  const { isPremium } = usePremium()
  const [tab, setTab] = useState('search')
  const [uploads, setUploads] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterSem, setFilterSem] = useState('')

  const [uploadForm, setUploadForm] = useState({ title: '', subject: '', topic: '', semester: '', department: '' })
  const [requestForm, setRequestForm] = useState({ subject: '', topic: '', department: '', semester: '', description: '', urgency: 'normal' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const tabs = [
    { id: 'search', label: 'Search Notes' },
    { id: 'upload', label: 'Upload Notes' },
    { id: 'request', label: 'Request Notes' },
    { id: 'my-uploads', label: 'My Uploads' },
    { id: 'my-requests', label: 'My Requests' }
  ]

  useEffect(() => {
    if (!user) return
    const unsub1 = onSnapshot(
      query(collection(db, 'notesUploads'), orderBy('createdAt', 'desc')),
      snap => {
        setUploads(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      () => { setLoading(false); reloadData() }
    )
    const unsub2 = onSnapshot(
      query(collection(db, 'notesRequests'), orderBy('createdAt', 'desc')),
      snap => { setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() }))) },
      () => reloadData()
    )
    return () => { unsub1(); unsub2() }
  }, [user])

  const handleUpload = async () => {
    if (!uploadForm.title || !file) return toast.error('Title and file required')
    setUploading(true)
    try {
      const fileName = `${user.uid}/${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage.from('notes-files').upload(fileName, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('notes-files').getPublicUrl(fileName)

      await addDoc(collection(db, 'notesUploads'), {
        ...uploadForm,
        uid: user.uid,
        fileName: file.name,
        fileUrl: publicUrl,
        fileType: file.type,
        createdAt: new Date().toISOString()
      })
      await awardXp(100, 'first_notes')
      setShowUpload(false)
      setUploadForm({ title: '', subject: '', topic: '', semester: '', department: '' })
      setFile(null)
      toast.success('Notes uploaded! +100 XP')
      reloadData()
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteUpload = async (id, fileUrl) => {
    if (!confirm('Delete this upload?')) return
    await deleteDoc(doc(db, 'notesUploads', id))
    toast.success('Deleted')
  }

  const reloadData = async () => {
    const [uSnap, rSnap] = await Promise.all([
      getDocs(query(collection(db, 'notesUploads'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'notesRequests'), orderBy('createdAt', 'desc')))
    ])
    setUploads(uSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setRequests(rSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const handleRequest = async () => {
    if (!requestForm.subject) return toast.error('Subject is required')
    try {
      await addDoc(collection(db, 'notesRequests'), {
        ...requestForm,
        uid: user.uid,
        status: 'open',
        createdAt: new Date().toISOString()
      })
      setShowRequest(false)
      setRequestForm({ subject: '', topic: '', department: '', semester: '', description: '', urgency: 'normal' })
      toast.success('Request submitted')
      reloadData()
    } catch {
      toast.error('Failed to submit request')
    }
  }

  const handleDeleteRequest = async (id) => {
    if (!confirm('Delete this request?')) return
    await deleteDoc(doc(db, 'notesRequests', id))
    toast.success('Deleted')
  }

  const filteredUploads = uploads.filter(u => {
    if (search && !u.title?.toLowerCase().includes(search.toLowerCase()) && !u.subject?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterSubject && u.subject !== filterSubject) return false
    if (filterDept && u.department !== filterDept) return false
    if (filterSem && u.semester !== filterSem) return false
    return true
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold gradient-text">Notes Hub</h1>
          <p className="text-sm text-secondary">Share and find academic notes</p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer border-0 ${
              tab === t.id ? 'gradient-bg text-white' : 'bg-[var(--bg-secondary)] text-secondary hover:bg-hover'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by keyword..." icon={Search} className="md:col-span-2" />
            <Input value={filterSubject} onChange={e => setFilterSubject(e.target.value)} placeholder="Subject..." />
            <Input value={filterDept} onChange={e => setFilterDept(e.target.value)} placeholder="Department..." />
          </div>
          {filteredUploads.length === 0 ? (
            <EmptyState icon={Search} title="No notes found" description="Try different search terms" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredUploads.map(note => (
                <GlassCard key={note.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-[var(--accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-primary text-sm truncate">{note.title}</h3>
                      <p className="text-xs text-muted">{note.subject} • {note.semester}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium hover:bg-[var(--accent)]/20 transition-colors no-underline">
                          <Download size={12} /> Open
                        </a>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'upload' && (
        <div className="space-y-4">
          <Button onClick={() => setShowUpload(true)} icon={Upload}>Upload New Notes</Button>
          <div className="text-sm text-muted">
            <p>Supported formats: PDF, DOC, PPT, Images</p>
            {!isPremium && <p className="text-xs mt-1">Free users: max 5 uploads. <span className="text-[var(--accent)]">Premium</span> for unlimited.</p>}
          </div>
        </div>
      )}

      {tab === 'request' && (
        <div className="space-y-4">
          <Button onClick={() => setShowRequest(true)} icon={AlertCircle}>Request Notes</Button>
          {requests.filter(r => r.uid !== user.uid && r.status === 'open').length === 0 ? (
            <EmptyState icon={BookOpen} title="No open requests" description="Be the first to request notes" />
          ) : (
            <div className="space-y-3">
              {requests.filter(r => r.uid !== user.uid && r.status === 'open').map(req => (
                <GlassCard key={req.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-primary">{req.subject}</h3>
                      <p className="text-xs text-muted">{req.topic} • {req.semester}</p>
                      {req.description && <p className="text-xs text-secondary mt-1">{req.description}</p>}
                    </div>
                    <Badge variant={req.urgency === 'urgent' ? 'danger' : req.urgency === 'high' ? 'warning' : 'default'}>{req.urgency}</Badge>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'my-uploads' && (
        <div className="space-y-3">
          {uploads.filter(u => u.uid === user.uid).length === 0 ? (
            <EmptyState icon={Upload} title="No uploads yet" description="Upload your first set of notes" action={<Button onClick={() => setShowUpload(true)} icon={Upload}>Upload Notes</Button>} />
          ) : (
            uploads.filter(u => u.uid === user.uid).map(note => (
              <GlassCard key={note.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-[var(--accent)]" />
                    <div>
                      <p className="text-sm font-medium text-primary">{note.title}</p>
                      <p className="text-xs text-muted">{note.subject} • {note.semester}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-hover text-muted transition-colors">
                      <Download size={16} />
                    </a>
                    <button onClick={() => handleDeleteUpload(note.id, note.fileUrl)} className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-[var(--danger)] transition-colors cursor-pointer border-0 bg-transparent">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {tab === 'my-requests' && (
        <div className="space-y-3">
          {requests.filter(r => r.uid === user.uid).length === 0 ? (
            <EmptyState icon={AlertCircle} title="No requests yet" description="Request notes you need" action={<Button onClick={() => setShowRequest(true)} icon={AlertCircle}>Request Notes</Button>} />
          ) : (
            requests.filter(r => r.uid === user.uid).map(req => (
              <GlassCard key={req.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">{req.subject}</p>
                    <p className="text-xs text-muted">{req.topic} • {req.semester}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={req.status === 'open' ? 'warning' : 'success'}>{req.status}</Badge>
                    <button onClick={() => handleDeleteRequest(req.id)} className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-[var(--danger)] transition-colors cursor-pointer border-0 bg-transparent">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Notes" size="lg">
        <div className="space-y-4">
          <Input label="Title *" value={uploadForm.title} onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Chapter 5 Notes" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Subject" value={uploadForm.subject} onChange={e => setUploadForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Data Structures" />
            <Input label="Topic" value={uploadForm.topic} onChange={e => setUploadForm(p => ({ ...p, topic: e.target.value }))} placeholder="e.g. Linked Lists" />
            <Input label="Semester" value={uploadForm.semester} onChange={e => setUploadForm(p => ({ ...p, semester: e.target.value }))} placeholder="e.g. 3rd" />
            <Input label="Department" value={uploadForm.department} onChange={e => setUploadForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. CSE" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary">File *</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" className="w-full text-sm text-primary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[var(--accent)] file:text-white hover:file:opacity-90 cursor-pointer" />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowUpload(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleUpload} loading={uploading} className="flex-1">Upload</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRequest} onClose={() => setShowRequest(false)} title="Request Notes">
        <div className="space-y-4">
          <Input label="Subject *" value={requestForm.subject} onChange={e => setRequestForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Data Structures" />
          <Input label="Topic" value={requestForm.topic} onChange={e => setRequestForm(p => ({ ...p, topic: e.target.value }))} placeholder="e.g. Linked Lists" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Department" value={requestForm.department} onChange={e => setRequestForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. CSE" />
            <Input label="Semester" value={requestForm.semester} onChange={e => setRequestForm(p => ({ ...p, semester: e.target.value }))} placeholder="e.g. 3rd" />
          </div>
          <Input label="Description" value={requestForm.description} onChange={e => setRequestForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe what you need..." />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary">Urgency</label>
            <div className="flex gap-2">
              {['low', 'normal', 'high', 'urgent'].map(u => (
                <button
                  key={u}
                  onClick={() => setRequestForm(p => ({ ...p, urgency: u }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-0 ${
                    requestForm.urgency === u ? 'gradient-bg text-white' : 'bg-[var(--bg-secondary)] text-secondary hover:bg-hover'
                  }`}
                >
                  {u.charAt(0).toUpperCase() + u.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowRequest(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleRequest} className="flex-1">Submit Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
