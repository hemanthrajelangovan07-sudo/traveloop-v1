import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import { Calendar, MapPin, Clock, DollarSign, Share2, Download, Edit3, ChevronRight, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import './ItineraryView.css'

export default function ItineraryView() {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/trips/${id}`).then(({ data }) => {
      setTrip(data)
      setLoading(false)
    }).catch(() => toast.error('Trip not found'))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>
  if (!trip) return <div>Trip not found</div>

  const copyShare = () => {
    const url = `${window.location.origin}/shared/${trip.public_token}`
    navigator.clipboard.writeText(url)
    toast.success('Share link copied! 🔗')
  }

  return (
    <div className="itinerary-view">
      <div className="view-hero" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), var(--bg)), url(${trip.cover_photo || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200'})` }}>
        <div className="hero-content">
          <div className="flex items-center gap-2 text-white/70 mb-2">
            <Link to="/trips" className="hover:text-white">My Trips</Link>
            <ChevronRight size={14} />
          </div>
          <h1>{trip.title}</h1>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="hero-stat">
              <Calendar size={18} />
              <span>{new Date(trip.start_date).toLocaleDateString()} — {new Date(trip.end_date).toLocaleDateString()}</span>
            </div>
            <div className="hero-stat">
              <MapPin size={18} />
              <span>{trip.stops.length} Cities</span>
            </div>
            <div className="hero-stat">
              <DollarSign size={18} />
              <span>Budget: ${trip.total_budget}</span>
            </div>
          </div>
          <div className="hero-actions mt-6 flex gap-3">
            <Link to={`/trips/${id}/build`} className="btn btn-primary"><Edit3 size={18}/> Edit Plan</Link>
            <button className="btn btn-secondary" onClick={copyShare}><Share2 size={18}/> Share</button>
            <button className="btn btn-secondary"><Download size={18}/> Export PDF</button>
          </div>
        </div>
      </div>

      <div className="view-grid mt-6">
        <div className="view-main">
          <div className="section-header">
            <h2>Your Journey <span className="text-primary-light">Timeline</span></h2>
          </div>

          <div className="view-timeline timeline">
            {trip.stops.map((stop, idx) => (
              <div key={stop.id} className="view-stop timeline-item">
                <div className="timeline-dot" />
                <div className="card view-stop-card">
                  <div className="view-stop-header">
                    <div className="view-stop-city">
                      <span className="day-label">Stop {idx + 1}</span>
                      <h3>{stop.city.name}</h3>
                      <p className="text-text2">{stop.city.country}</p>
                    </div>
                    <div className="view-stop-dates">
                      <p className="text-sm fw-600">{new Date(stop.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(stop.departure_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-xs text-text3 text-right">Stay: {Math.max((new Date(stop.departure_date) - new Date(stop.arrival_date)) / (1000 * 3600 * 24), 0)} days</p>
                    </div>
                  </div>
                  
                  <div className="view-activities mt-4">
                    <h4 className="text-xs uppercase tracking-wider text-text3 mb-2">Planned Activities</h4>
                    <div className="flex flex-col gap-2">
                      {stop.stop_activities.map(sa => (
                        <div key={sa.id} className="view-activity-item flex items-center gap-3">
                          <CheckCircle2 size={16} className={sa.completed ? 'text-success' : 'text-border'} />
                          <div className="flex-1">
                            <p className={`text-sm ${sa.completed ? 'text-text3 line-through' : ''}`}>{sa.activity.name}</p>
                          </div>
                          <span className="text-xs text-text3">${sa.custom_cost || sa.activity.cost}</span>
                        </div>
                      ))}
                      {stop.stop_activities.length === 0 && <p className="text-xs text-text3 italic">No activities planned for this stop.</p>}
                    </div>
                  </div>

                  <div className="view-stop-footer mt-4 pt-3 flex justify-between items-center border-top">
                    <div className="flex gap-4">
                      <span className="text-xs text-text2"><Clock size={12}/> {stop.city.timezone}</span>
                    </div>
                    <Link to={`/activities?city_id=${stop.city.id}`} className="text-xs text-primary-light hover:underline">Add more +</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="view-side">
          <div className="card sticky-side">
            <h3>Trip Overview</h3>
            <div className="divider" />
            <div className="view-summary-list">
              <Link to={`/trips/${id}/budget`} className="summary-item card-sm flex justify-between items-center hover:bg-surface2">
                <div className="flex items-center gap-3">
                  <div className="icon-box bg-success/10 text-success"><DollarSign size={18}/></div>
                  <div><p className="text-sm fw-600">Budget</p><p className="text-xs text-text3">Track expenses</p></div>
                </div>
                <ChevronRight size={16} />
              </Link>
              <Link to={`/trips/${id}/checklist`} className="summary-item card-sm flex justify-between items-center mt-2 hover:bg-surface2">
                <div className="flex items-center gap-3">
                  <div className="icon-box bg-primary/10 text-primary"><CheckCircle2 size={18}/></div>
                  <div><p className="text-sm fw-600">Checklist</p><p className="text-xs text-text3">Packing list</p></div>
                </div>
                <ChevronRight size={16} />
              </Link>
              <Link to={`/trips/${id}/notes`} className="summary-item card-sm flex justify-between items-center mt-2 hover:bg-surface2">
                <div className="flex items-center gap-3">
                  <div className="icon-box bg-warning/10 text-warning"><Edit3 size={18}/></div>
                  <div><p className="text-sm fw-600">Notes</p><p className="text-xs text-text3">Trip journal</p></div>
                </div>
                <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="mt-6">
              <h4 className="text-xs uppercase text-text3 mb-2">Trip Progress</h4>
              <div className="progress-bar">
                <div className="progress-fill bg-primary" style={{ width: '35%' }} />
              </div>
              <p className="text-xs text-text2 mt-1">35% of activities completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
