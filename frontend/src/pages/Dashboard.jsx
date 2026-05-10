import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { Plus, Calendar, MapPin, DollarSign, ArrowRight, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import './Dashboard.css'

export default function Dashboard() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalTrips: 0, citiesVisited: 0, totalSpent: 0 })

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/trips/')
        setTrips(data.slice(0, 3))
        
        // Calculate basic stats from all trips
        let spent = 0
        let cities = new Set()
        data.forEach(t => {
          spent += t.total_budget || 0 // This is a placeholder, real spent comes from budget endpoint
          t.stops.forEach(s => cities.add(s.city.id))
        })
        
        setStats({
          totalTrips: data.length,
          citiesVisited: cities.size,
          totalSpent: Math.round(spent)
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
  ]

  if (loading) return <div className="flex justify-center items-center h-full"><div className="spinner" /></div>

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Welcome back, <span className="gradient-text">Traveler</span></h1>
        <p>Ready for your next adventure?</p>
      </div>

      <div className="grid-3 mb-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(108,99,255,0.1)', color: 'var(--primary)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-value">{stats.totalTrips}</div>
          <div className="stat-label">Total Trips Planned</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--success)' }}>
            <MapPin size={24} />
          </div>
          <div className="stat-value">{stats.citiesVisited}</div>
          <div className="stat-label">Cities Explored</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,217,61,0.1)', color: 'var(--accent2)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-value">${stats.totalSpent}</div>
          <div className="stat-label">Est. Travel Budget</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-main">
          <div className="section-header">
            <h2>Recent Journeys</h2>
            <Link to="/trips" className="btn btn-ghost btn-sm">View All <ArrowRight size={14} /></Link>
          </div>

          {trips.length > 0 ? (
            <div className="recent-trips">
              {trips.map(trip => (
                <Link key={trip.id} to={`/trips/${trip.id}/view`} className="trip-row card-sm">
                  <div className="trip-row-img">
                    <img src={trip.cover_photo || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100'} alt="" />
                  </div>
                  <div className="trip-row-info">
                    <h3>{trip.title}</h3>
                    <p>{trip.start_date} • {trip.stops.length} stops</p>
                  </div>
                  <div className="trip-row-status">
                    <span className={`badge badge-${trip.status === 'planning' ? 'warning' : 'success'}`}>
                      {trip.status}
                    </span>
                  </div>
                  <ArrowRight size={18} className="trip-row-arrow" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="card empty-dash-card">
              <Plus size={40} />
              <h3>No trips yet</h3>
              <p>Start planning your first multi-city adventure today!</p>
              <Link to="/trips/new" className="btn btn-primary mt-2">Plan New Trip</Link>
            </div>
          )}
        </div>

        <div className="dash-side">
          <div className="card">
            <div className="section-header mb-2">
              <h3>Travel Trends</h3>
              <TrendingUp size={16} className="text-primary" />
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--primary-light)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'var(--primary)' : 'var(--surface2)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center mt-2 text-text3">Your activity over the last 6 months</p>
          </div>

          <div className="card mt-4 quick-actions">
            <h3>Quick Actions</h3>
            <div className="grid-2 mt-2">
              <Link to="/trips/new" className="btn btn-secondary flex-col items-center py-4">
                <Plus size={20} /> <span className="mt-1">New Trip</span>
              </Link>
              <Link to="/cities" className="btn btn-secondary flex-col items-center py-4">
                <Search size={20} /> <span className="mt-1">Explore</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Search({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> }
