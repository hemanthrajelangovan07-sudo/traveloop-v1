import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { Plus, Search, Calendar, MapPin, MoreVertical, Edit2, Trash2, ExternalLink, Plane } from 'lucide-react'
import toast from 'react-hot-toast'
import './MyTrips.css'

export default function MyTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const fetchTrips = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/trips/')
      setTrips(data)
    } catch (err) {
      toast.error('Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrips() }, [])

  const deleteTrip = async (id) => {
    if (!confirm('Are you sure you want to delete this trip?')) return
    try {
      await api.delete(`/trips/${id}`)
      toast.success('Trip deleted')
      setTrips(trips.filter(t => t.id !== id))
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const filteredTrips = trips.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.stops.some(s => s.city.name.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="my-trips">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>My <span className="gradient-text">Journeys</span></h1>
          <p>You have {trips.length} trips planned</p>
        </div>
        <Link to="/trips/new" className="btn btn-primary btn-lg">
          <Plus size={20} /> Plan New Trip
        </Link>
      </div>

      <div className="trips-filter card-sm mb-4 flex items-center gap-2">
        <Search size={18} className="text-text3" />
        <input 
          type="text" 
          placeholder="Search by trip name or city..." 
          className="filter-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="spinner" /></div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid-3">
          {filteredTrips.map(trip => (
            <div key={trip.id} className="trip-card card">
              <div className="trip-card-image">
                <img src={trip.cover_photo || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'} alt={trip.title} />
                <div className="trip-card-overlay">
                  <div className="flex justify-between items-start w-full">
                    <span className={`badge badge-${trip.status === 'planning' ? 'warning' : 'success'}`}>
                      {trip.status}
                    </span>
                    <div className="trip-actions-dropdown">
                      <button className="btn btn-icon btn-ghost"><MoreVertical size={16} /></button>
                      <div className="dropdown-content">
                        <Link to={`/trips/${trip.id}/edit`}><Edit2 size={14}/> Edit</Link>
                        <button onClick={() => deleteTrip(trip.id)} className="text-accent"><Trash2 size={14}/> Delete</button>
                      </div>
                    </div>
                  </div>
                  <Link to={`/trips/${trip.id}/view`} className="btn btn-primary btn-sm mt-auto">View Plan</Link>
                </div>
              </div>
              <div className="trip-card-content">
                <h3 className="truncate">{trip.title}</h3>
                <div className="trip-meta mt-1">
                  <div className="flex items-center gap-1 text-sm text-text2">
                    <Calendar size={14} /> <span>{new Date(trip.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-text2 mt-1">
                    <MapPin size={14} /> <span>{trip.stops.length} stops</span>
                  </div>
                </div>
                <div className="trip-footer mt-2 flex justify-between items-center pt-2">
                  <div className="trip-cities flex -space-x-2">
                    {trip.stops.slice(0, 3).map((s, i) => (
                      <div key={i} className="mini-city-tag" title={s.city.name}>{s.city.name[0]}</div>
                    ))}
                    {trip.stops.length > 3 && <div className="mini-city-tag more">+{trip.stops.length - 3}</div>}
                  </div>
                  <div className="text-xs fw-600 text-primary-light">
                    ${trip.total_budget || 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Plane size={60} />
          <h3>No trips found</h3>
          <p>Try a different search or start a new adventure.</p>
          <Link to="/trips/new" className="btn btn-secondary mt-2">Clear Search</Link>
        </div>
      )}
    </div>
  )
}
