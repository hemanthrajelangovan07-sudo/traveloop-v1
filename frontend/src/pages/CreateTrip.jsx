import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { Save, X, Calendar, Image as ImageIcon, Map } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateTrip() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total_budget: 0,
    cover_photo: '',
    is_public: false
  })

  useEffect(() => {
    if (id) {
      api.get(`/trips/${id}`).then(({ data }) => setForm(data)).catch(() => toast.error('Failed to load trip'))
    }
  }, [id])

  const upd = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (id) {
        await api.put(`/trips/${id}`, form)
        toast.success('Trip updated')
      } else {
        const { data } = await api.post('/trips/', form)
        toast.success('Trip created! Time to add stops.')
        navigate(`/trips/${data.id}/build`)
        return
      }
      navigate('/trips')
    } catch (err) {
      toast.error('Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-trip" style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <h1>{id ? 'Edit' : 'Create New'} <span className="gradient-text">Journey</span></h1>
        <p>{id ? 'Refine your travel details' : 'The first step to an unforgettable adventure'}</p>
      </div>

      <div className="card max-w-700 mx-auto">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Trip Title</label>
            <input className="form-input" name="title" placeholder="e.g., Summer in Europe" value={form.title} onChange={upd} required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" name="start_date" value={form.start_date} onChange={upd} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" name="end_date" value={form.end_date} onChange={upd} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Budget ($)</label>
            <input type="number" className="form-input" name="total_budget" value={form.total_budget} onChange={upd} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" name="description" placeholder="What are your goals for this trip?" value={form.description} onChange={upd} />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Photo URL (optional)</label>
            <div className="flex gap-2">
              <input className="form-input" name="cover_photo" placeholder="https://unsplash.com/..." value={form.cover_photo} onChange={upd} />
              {form.cover_photo && (
                <div className="w-64 h-36 rounded-lg overflow-hidden border border-border flex-shrink-0">
                  <img src={form.cover_photo} className="w-full h-full object-cover" alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="is_public" name="is_public" checked={form.is_public} onChange={upd} />
            <label htmlFor="is_public" className="text-sm font-600 cursor-pointer">Make this itinerary public</label>
          </div>

          <div className="divider" />

          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}><X size={18}/> Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Save size={18}/> {id ? 'Update Trip' : 'Create & Continue'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
