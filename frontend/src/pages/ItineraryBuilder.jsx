import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import { Plus, Search, Calendar, MapPin, Trash2, Clock, DollarSign, ChevronRight, Layout, List } from 'lucide-react'
import toast from 'react-hot-toast'
import './ItineraryBuilder.css'

export default function ItineraryBuilder() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddStop, setShowAddStop] = useState(false)
  const [cities, setCities] = useState([])
  const [search, setSearch] = useState('')

  const fetchTrip = async () => {
    try {
      const { data } = await api.get(`/trips/${id}`)
      setTrip(data)
    } catch (err) {
      toast.error('Failed to load trip')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrip() }, [id])

  useEffect(() => {
    if (search.length > 1) {
      api.get(`/cities/?q=${search}`).then(({ data }) => setCities(data))
    }
  }, [search])

  const addStop = async (cityId) => {
    try {
      // Default dates based on trip start or last stop end
      const lastStop = trip.stops[trip.stops.length - 1]
      const start = lastStop ? lastStop.departure_date : trip.start_date
      const end = new Date(new Date(start).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      await api.post(`/trips/${id}/stops`, {
        city_id: cityId,
        arrival_date: start,
        departure_date: end,
        order: trip.stops.length
      })
      toast.success('Stop added')
      setShowAddStop(false)
      fetchTrip()
    } catch (err) {
      toast.error('Failed to add stop')
    }
  }

  const removeStop = async (stopId) => {
    try {
      await api.delete(`/trips/${id}/stops/${stopId}`)
      toast.success('Stop removed')
      fetchTrip()
    } catch (err) {
      toast.error('Failed to remove')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>
  if (!trip) return <div>Trip not found</div>

  return (
    <div className="itinerary-builder">
      <div className="page-header flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-primary-light mb-1">
            <Link to="/trips" className="text-xs hover:underline">My Trips</Link>
            <ChevronRight size={12} />
          </div>
          <h1>Builder: <span className="gradient-text">{trip.title}</span></h1>
          <p>{trip.stops.length} cities in your plan</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/trips/${id}/view`} className="btn btn-secondary"><Layout size={18}/> Full View</Link>
          <button className="btn btn-primary" onClick={() => setShowAddStop(true)}><Plus size={18}/> Add Stop</button>
        </div>
      </div>

      <div className="builder-content mt-4">
        {trip.stops.length === 0 ? (
          <div className="card empty-builder" onClick={() => setShowAddStop(true)}>
            <MapPin size={48} />
            <h3>Your itinerary is empty</h3>
            <p>Click to add your first destination and start planning!</p>
            <button className="btn btn-primary mt-2">Add First City</button>
          </div>
        ) : (
          <div className="stops-list timeline">
            {trip.stops.map((stop, idx) => (
              <div key={stop.id} className="timeline-item stop-item card">
                <div className="timeline-dot" />
                <div className="stop-header">
                  <div className="stop-img">
                    <img src={stop.city.image_url} alt="" />
                  </div>
                  <div className="stop-main">
                    <div className="flex justify-between">
                      <h3>{stop.city.name}, {stop.city.country}</h3>
                      <button className="btn btn-ghost btn-icon text-accent" onClick={() => removeStop(stop.id)}><Trash2 size={16}/></button>
                    </div>
                    <div className="flex gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-text2"><Calendar size={14}/> {stop.arrival_date} to {stop.departure_date}</div>
                      <div className="flex items-center gap-1 text-sm text-text2"><Clock size={14}/> {Math.max((new Date(stop.departure_date) - new Date(stop.arrival_date)) / (1000 * 3600 * 24), 0)} days</div>
                    </div>
                  </div>
                </div>
                
                <div className="stop-details mt-4 grid-2">
                  <div className="activities-section">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm">Activities</h4>
                      <Link to="/activities" className="btn btn-ghost btn-sm text-primary">+ Explore</Link>
                    </div>
                    <div className="activities-mini-list">
                      {stop.stop_activities.length > 0 ? stop.stop_activities.map(sa => (
                        <div key={sa.id} className="mini-act card-sm mb-1 flex justify-between items-center">
                          <span className="text-sm">{sa.activity.name}</span>
                          <span className="text-xs text-text3">${sa.custom_cost || sa.activity.cost}</span>
                        </div>
                      )) : <p className="text-xs text-text3 italic">No activities added yet</p>}
                    </div>
                  </div>
                  <div className="budget-mini-section">
                    <h4 className="text-sm mb-2">Est. Costs</h4>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs"><span>Stay</span> <span>${stop.accommodation_cost}</span></div>
                      <div className="flex justify-between text-xs"><span>Travel</span> <span>${stop.transport_cost}</span></div>
                      <div className="flex justify-between text-xs"><span>Meals</span> <span>${stop.meal_cost}</span></div>
                      <div className="divider" style={{margin:'4px 0'}} />
                      <div className="flex justify-between text-xs fw-600 color-primary"><span>Total</span> <span>${stop.accommodation_cost + stop.transport_cost + stop.meal_cost}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Stop Modal */}
      {showAddStop && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Destination</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAddStop(false)}><X size={20}/></button>
            </div>
            <div className="form-group mb-4">
              <div className="flex items-center gap-2 form-input">
                <Search size={18} className="text-text3" />
                <input type="text" placeholder="Search cities (Paris, Tokyo...)" style={{background:'none', border:'none', outline:'none', color:'inherit', flex:1}} value={search} onChange={e => setSearch(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="city-results flex flex-col gap-2 max-h-400 overflow-y-auto">
              {cities.map(city => (
                <div key={city.id} className="city-result-item card-sm flex items-center gap-3 cursor-pointer hover:bg-surface2" onClick={() => addStop(city.id)}>
                  <img src={city.image_url} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="fw-600">{city.name}</p>
                    <p className="text-xs text-text2">{city.country}</p>
                  </div>
                  <Plus size={18} className="text-primary" />
                </div>
              ))}
              {search && cities.length === 0 && <p className="text-center py-4 text-text3">No cities found matching "{search}"</p>}
              {!search && <p className="text-center py-4 text-text3">Start typing to find destinations</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function X({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> }
