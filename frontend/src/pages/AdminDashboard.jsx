import { useState, useEffect } from 'react'
import api from '../api'
import { Users, Plane, MapPin, Activity, ShieldAlert, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => {
      setData(data)
      setLoading(false)
    }).catch(() => toast.error('Access denied or failed to load'))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>
  if (!data) return <div>Access denied</div>

  const statusData = [
    { name: 'Planning', value: data.trip_status.planning, color: '#fb923c' },
    { name: 'Ongoing', value: data.trip_status.ongoing, color: '#4ade80' },
    { name: 'Completed', value: data.trip_status.completed, color: '#6c63ff' },
  ]

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Platform <span className="gradient-text">Analytics</span></h1>
        <p>Monitor Traveloop usage and user engagement</p>
      </div>

      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon bg-primary/10 text-primary"><Users size={24}/></div>
          <div className="stat-value">{data.totals.users}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-success/10 text-success"><Plane size={24}/></div>
          <div className="stat-value">{data.totals.trips}</div>
          <div className="stat-label">Trips Created</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-warning/10 text-warning"><Activity size={24}/></div>
          <div className="stat-value">{data.totals.activities_booked}</div>
          <div className="stat-label">Activities Added</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-accent/10 text-accent"><ShieldAlert size={24}/></div>
          <div className="stat-value">{data.totals.public_trips}</div>
          <div className="stat-label">Public Itineraries</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Trip Status Distribution</h3>
            <BarChart3 size={18} className="text-text3" />
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface2)', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {statusData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-text2">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Top Destinations</h3>
          <div className="divider" />
          <div className="flex flex-col gap-4">
            {data.top_cities.map((city, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg2 flex items-center justify-center text-xs fw-800">{i+1}</div>
                <div className="flex-1">
                  <p className="text-sm fw-600">{city.name}</p>
                  <p className="text-xs text-text3">{city.country}</p>
                </div>
                <div className="badge badge-primary">{city.trip_count} trips</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h3>Recent User Registrations</h3>
        <div className="divider" />
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'badge-accent2' : 'badge-primary'}`}>{u.role}</span></td>
                <td><button className="btn btn-ghost btn-sm">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
