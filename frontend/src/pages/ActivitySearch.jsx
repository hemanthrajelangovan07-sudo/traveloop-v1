import { useState, useEffect } from 'react'
import api from '../api'
import { Search, Activity, Clock, DollarSign, Plus, Info, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import './ActivitySearch.css'

export default function ActivitySearch() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [trips, setTrips] = useState([])
  const [selectedAct, setSelectedAct] = useState(null)

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const url = `/activities/?${query ? `q=${query}&` : ''}${category ? `category=${category}` : ''}`
      const { data } = await api.get(url)
      setActivities(data)
    } catch (err) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const fetchTrips = async () => {
    try {
      const { data } = await api.get('/trips/')
      setTrips(data)
    } catch (err) {}
  }

  useEffect(() => {
    const timeout = setTimeout(fetchActivities, 300)
    return () => clearTimeout(timeout)
  }, [query, category])

  useEffect(() => { fetchTrips() }, [])

  const categories = ['sightseeing', 'food', 'adventure', 'culture', 'shopping']

  const addToStop = async (tripId, stopId, activityId) => {
    try {
      await api.post(`/trips/${tripId}/stops/${stopId}/activities`, { activity_id: activityId })
      toast.success('Activity added to itinerary! 🎟️')
      setSelectedAct(null)
    } catch (err) {
      toast.error('Failed to add activity')
    }
  }

  return (
    <div className="activity-search">
      <div className="page-header">
        <h1>Curated <span className="gradient-text">Experiences</span></h1>
        <p>Find the best things to do in every city you visit</p>
      </div>

      <div className="search-controls card flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="form-group flex-1">
            <div className="flex items-center gap-2 form-input">
              <Search size={18} className="text-text3" />
              <input 
                type="text" 
                placeholder="Search activities..." 
                className="raw-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group w-64">
            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : activities.length > 0 ? (
          <div className="grid-3">
            {activities.map(act => (
              <div key={act.id} className="activity-card card">
                <div className="activity-card-header flex justify-between items-start">
                  <div className="flex-1">
                    <span className="badge badge-primary mb-2">{act.category}</span>
                    <h3>{act.name}</h3>
                  </div>
                  <div className="activity-cost badge badge-success">${act.cost}</div>
                </div>
                <p className="text-sm text-text2 mt-2 line-clamp-2">{act.description}</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-text3">
                  <span className="flex items-center gap-1"><Clock size={12}/> {act.duration_hours}h</span>
                  <span className="flex items-center gap-1"><Info size={12}/> Guided</span>
                </div>
                <div className="divider" />
                <button className="btn btn-secondary w-full" onClick={() => setSelectedAct(act)}>
                  <Plus size={16}/> Add to Trip
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Activity size={60} />
            <h3>No activities found</h3>
            <p>Try a different keyword or category.</p>
          </div>
        )}
      </div>

      {/* Add to Trip Modal */}
      {selectedAct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add to Itinerary</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedAct(null)}><X size={20}/></button>
            </div>
            <p className="text-sm text-text2 mb-4">Select a trip and stop for <strong>{selectedAct.name}</strong></p>
            <div className="trip-stop-selector flex flex-col gap-3">
              {trips.length > 0 ? trips.map(trip => (
                <div key={trip.id} className="trip-select-group">
                  <h4 className="text-xs uppercase text-text3 mb-2">{trip.title}</h4>
                  <div className="flex flex-col gap-1">
                    {trip.stops.map(stop => (
                      <div key={stop.id} className="stop-select-item card-sm flex justify-between items-center cursor-pointer hover:bg-surface2" onClick={() => addToStop(trip.id, stop.id, selectedAct.id)}>
                        <span className="text-sm">{stop.city.name}</span>
                        <Plus size={14} className="text-primary" />
                      </div>
                    ))}
                    {trip.stops.length === 0 && <p className="text-xs text-text3 italic p-2">No stops in this trip</p>}
                  </div>
                </div>
              )) : <p>You haven't created any trips yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function X({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> }
