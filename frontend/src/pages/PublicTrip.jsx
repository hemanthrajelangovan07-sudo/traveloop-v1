import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import { Calendar, MapPin, Globe, Copy, Plane } from 'lucide-react'
import toast from 'react-hot-toast'
import './PublicTrip.css'

export default function PublicTrip() {
  const { token } = useParams()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/trips/public/${token}`).then(({ data }) => {
      setTrip(data)
      setLoading(false)
    }).catch(() => toast.error('Trip not found or no longer public'))
  }, [token])

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>
  if (!trip) return (
    <div className="public-error flex flex-col items-center justify-center h-screen gap-4">
      <Globe size={60} className="text-text3" />
      <h2>Itinerary not found</h2>
      <p>This trip might be private or the link is invalid.</p>
      <Link to="/" className="btn btn-primary">Go to Traveloop</Link>
    </div>
  )

  return (
    <div className="public-trip">
      <nav className="public-nav flex justify-between items-center px-8 py-4 border-bottom">
        <div className="flex items-center gap-2 font-800 text-xl tracking-tighter">
          <Plane className="text-primary" /> Traveloop
        </div>
        <Link to="/login" className="btn btn-secondary btn-sm">Plan Your Own Trip</Link>
      </nav>

      <div className="public-hero" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), var(--bg)), url(${trip.cover_photo || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200'})` }}>
        <div className="hero-content text-center">
          <h1>{trip.title}</h1>
          <p className="mt-2 text-text2 max-w-600 mx-auto">{trip.description}</p>
          <div className="flex justify-center gap-6 mt-8">
            <div className="pub-stat">
              <Calendar size={20} className="text-primary" />
              <span>{new Date(trip.start_date).toLocaleDateString()}</span>
            </div>
            <div className="pub-stat">
              <MapPin size={20} className="text-primary" />
              <span>{trip.stops.length} Stops</span>
            </div>
          </div>
        </div>
      </div>

      <div className="public-content max-w-800 mx-auto p-8">
        <div className="section-header mb-8">
          <h2>Trip Timeline</h2>
        </div>
        
        <div className="timeline">
          {trip.stops.map((stop, idx) => (
            <div key={stop.id} className="timeline-item public-stop">
              <div className="timeline-dot" />
              <div className="card">
                <div className="flex gap-4">
                  <img src={stop.city.image_url} className="w-24 h-24 rounded-xl object-cover" />
                  <div>
                    <span className="text-xs fw-800 text-primary uppercase">Day {idx + 1}</span>
                    <h3 className="text-lg">{stop.city.name}</h3>
                    <p className="text-xs text-text3">{stop.city.country}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {stop.stop_activities.map(sa => (
                        <span key={sa.id} className="badge badge-secondary">{sa.activity.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="public-footer card mt-12 text-center bg-primary/5 border-primary/20">
          <h3>Love this itinerary?</h3>
          <p className="text-sm text-text2 mt-2">Create a Traveloop account to copy this plan and customize it for your own adventure.</p>
          <div className="flex justify-center gap-4 mt-6">
            <Link to="/login?action=signup" className="btn btn-primary">Start Planning</Link>
            <button className="btn btn-secondary" onClick={() => toast.success('Link copied!')}><Copy size={18}/> Copy Link</button>
          </div>
        </div>
      </div>
    </div>
  )
}
