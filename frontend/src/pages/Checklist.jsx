import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import { CheckSquare, Square, Plus, Trash2, RotateCcw, ChevronLeft, Luggage } from 'lucide-react'
import toast from 'react-hot-toast'
import './Checklist.css'

export default function Checklist() {
  const { id } = useParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')
  const [category, setCategory] = useState('general')

  const fetchItems = async () => {
    try {
      const { data } = await api.get(`/checklist/${id}`)
      setItems(data)
    } catch (err) {
      toast.error('Failed to load checklist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [id])

  const addItem = async (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    try {
      const { data } = await api.post(`/checklist/${id}`, { name: newItem, category })
      setItems([...items, data])
      setNewItem('')
    } catch (err) {
      toast.error('Add failed')
    }
  }

  const toggleItem = async (itemId) => {
    try {
      const { data } = await api.patch(`/checklist/${id}/${itemId}/toggle`)
      setItems(items.map(item => item.id === itemId ? data : item))
    } catch (err) {
      toast.error('Update failed')
    }
  }

  const deleteItem = async (itemId) => {
    try {
      await api.delete(`/checklist/${id}/${itemId}`)
      setItems(items.filter(item => item.id !== itemId))
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const resetList = async () => {
    if (!confirm('Clear all checkmarks?')) return
    try {
      await api.delete(`/checklist/${id}/reset/all`)
      setItems(items.map(i => ({ ...i, is_packed: false })))
      toast.success('Checklist reset')
    } catch (err) {
      toast.error('Reset failed')
    }
  }

  const categories = ['clothing', 'documents', 'electronics', 'general']
  const packedCount = items.filter(i => i.is_packed).length

  return (
    <div className="checklist-page">
      <div className="page-header flex justify-between items-center">
        <div>
          <Link to={`/trips/${id}/view`} className="flex items-center gap-1 text-xs text-text3 hover:text-primary mb-1"><ChevronLeft size={12}/> Back to Itinerary</Link>
          <h1>Packing <span className="gradient-text">Checklist</span></h1>
          <p>{items.length} items to pack</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={resetList}><RotateCcw size={14}/> Reset List</button>
      </div>

      <div className="checklist-stats card-sm mb-6 flex items-center gap-4">
        <div className="icon-box bg-primary/10 text-primary"><Luggage size={20}/></div>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="fw-600">Packing Progress</span>
            <span className="text-text3">{packedCount} / {items.length} packed</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill bg-primary" style={{ width: `${items.length ? (packedCount/items.length)*100 : 0}%` }} />
          </div>
        </div>
      </div>

      <div className="checklist-grid">
        <div className="checklist-main card">
          <form onSubmit={addItem} className="add-item-form mb-6 flex gap-2">
            <div className="form-group flex-1">
              <input 
                className="form-input" 
                placeholder="Add new item (e.g., Passport, Chargers...)" 
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
              />
            </div>
            <select className="form-input w-40" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="btn btn-primary btn-icon"><Plus size={20}/></button>
          </form>

          {loading ? (
            <div className="flex justify-center py-10"><div className="spinner" /></div>
          ) : (
            <div className="items-list">
              {categories.map(cat => {
                const catItems = items.filter(i => i.category === cat)
                if (catItems.length === 0 && cat !== 'general') return null
                return (
                  <div key={cat} className="cat-group mb-6">
                    <h4 className="cat-title text-xs uppercase tracking-wider text-text3 mb-3">{cat}</h4>
                    <div className="flex flex-col gap-2">
                      {catItems.map(item => (
                        <div key={item.id} className={`check-item flex items-center gap-3 p-3 rounded-xl border ${item.is_packed ? 'bg-bg2 border-transparent' : 'bg-surface2 border-border'}`}>
                          <button className="btn-icon btn-ghost p-0" onClick={() => toggleItem(item.id)}>
                            {item.is_packed ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} className="text-text3" />}
                          </button>
                          <span className={`flex-1 text-sm ${item.is_packed ? 'text-text3 line-through' : ''}`}>{item.name}</span>
                          <button className="btn btn-ghost btn-icon btn-sm text-text3 opacity-0 hover:opacity-100 delete-btn" onClick={() => deleteItem(item.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {catItems.length === 0 && cat === 'general' && <p className="text-center py-4 text-xs text-text3 italic">Your checklist is empty. Add items above!</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
