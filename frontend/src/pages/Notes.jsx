import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import { Plus, Trash2, Edit3, ChevronLeft, StickyNote, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import './Notes.css'

export default function Notes() {
  const { id } = useParams()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', stop_id: null })

  const fetchNotes = async () => {
    try {
      const { data } = await api.get(`/notes/${id}`)
      setNotes(data)
    } catch (err) {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotes() }, [id])

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await api.put(`/notes/${id}/${editId}`, form)
        toast.success('Note updated')
      } else {
        await api.post(`/notes/${id}`, form)
        toast.success('Note added')
      }
      setForm({ title: '', content: '', stop_id: null })
      setEditId(null)
      setShowAdd(false)
      fetchNotes()
    } catch (err) {
      toast.error('Save failed')
    }
  }

  const deleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return
    try {
      await api.delete(`/notes/${id}/${noteId}`)
      setNotes(notes.filter(n => n.id !== noteId))
      toast.success('Note removed')
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const startEdit = (note) => {
    setForm({ title: note.title, content: note.content, stop_id: note.stop_id })
    setEditId(note.id)
    setShowAdd(true)
  }

  return (
    <div className="notes-page">
      <div className="page-header flex justify-between items-center">
        <div>
          <Link to={`/trips/${id}/view`} className="flex items-center gap-1 text-xs text-text3 hover:text-primary mb-1"><ChevronLeft size={12}/> Back to Itinerary</Link>
          <h1>Trip <span className="gradient-text">Journal</span></h1>
          <p>Important notes and travel reminders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={18}/> New Note</button>
      </div>

      <div className="notes-grid mt-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : notes.length > 0 ? (
          <div className="grid-3">
            {notes.map(note => (
              <div key={note.id} className="note-card card">
                <div className="flex justify-between items-start mb-3">
                  <div className="note-icon bg-warning/10 text-warning p-2 rounded-lg">
                    <StickyNote size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => startEdit(note)}><Edit3 size={14}/></button>
                    <button className="btn btn-ghost btn-icon btn-sm text-accent" onClick={() => deleteNote(note.id)}><Trash2 size={14}/></button>
                  </div>
                </div>
                <h3>{note.title}</h3>
                <p className="text-sm text-text2 mt-2 whitespace-pre-wrap">{note.content}</p>
                <div className="note-footer mt-4 pt-3 border-top flex justify-between items-center text-xs text-text3">
                  <span className="flex items-center gap-1"><Clock size={12}/> {new Date(note.created_at).toLocaleDateString()}</span>
                  {note.stop_id && <span className="badge badge-primary">Linked Stop</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <StickyNote size={60} />
            <h3>No notes yet</h3>
            <p>Write down flight info, hotel details, or just travel thoughts!</p>
            <button className="btn btn-secondary mt-2" onClick={() => setShowAdd(true)}>Create Your First Note</button>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editId ? 'Edit Note' : 'Add Note'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => {setShowAdd(false); setEditId(null);}}><X size={20}/></button>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" placeholder="e.g., Hotel Check-in" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Note Content</label>
                <textarea className="form-input" placeholder="Write something..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} required />
              </div>
              <div className="divider" />
              <div className="flex justify-end gap-3">
                <button type="button" className="btn btn-secondary" onClick={() => {setShowAdd(false); setEditId(null);}}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update Note' : 'Save Note'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function X({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> }
