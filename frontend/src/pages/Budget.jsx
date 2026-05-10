import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import { DollarSign, PieChart as PieIcon, TrendingDown, AlertCircle, ChevronLeft, CreditCard } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import toast from 'react-hot-toast'
import './Budget.css'

export default function Budget() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/budget/${id}`).then(({ data }) => {
      setData(data)
      setLoading(false)
    }).catch(() => toast.error('Failed to load budget'))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><div className="spinner" /></div>
  if (!data) return <div>Data not found</div>

  const pieData = [
    { name: 'Accommodation', value: data.breakdown.accommodation, color: '#6c63ff' },
    { name: 'Transport', value: data.breakdown.transport, color: '#4ade80' },
    { name: 'Meals', value: data.breakdown.meals, color: '#fb923c' },
    { name: 'Activities', value: data.breakdown.activities, color: '#ffd93d' },
  ].filter(d => d.value > 0)

  return (
    <div className="budget-page">
      <div className="page-header flex justify-between items-center">
        <div>
          <Link to={`/trips/${id}/view`} className="flex items-center gap-1 text-xs text-text3 hover:text-primary mb-1"><ChevronLeft size={12}/> Back to Itinerary</Link>
          <h1>Trip <span className="gradient-text">Budget</span></h1>
          <p>Financial breakdown for {data.trip_title}</p>
        </div>
        <div className={`budget-alert badge ${data.over_budget ? 'badge-danger' : 'badge-success'}`}>
          <AlertCircle size={14} /> {data.over_budget ? 'Over Budget' : 'Within Budget'}
        </div>
      </div>

      <div className="grid-3 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">${data.spent}</div>
          <div className="progress-bar mt-2">
            <div className="progress-fill bg-primary" style={{ width: `${Math.min((data.spent/data.total_budget)*100, 100)}%` }} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Trip Budget</div>
          <div className="stat-value text-text2">${data.total_budget}</div>
          <div className="stat-label mt-1">Target allowance</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Remaining</div>
          <div className="stat-value" style={{ color: data.remaining < 0 ? 'var(--accent)' : 'var(--success)' }}>
            ${data.remaining}
          </div>
          <div className="stat-label mt-1">Left to spend</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <h3>Expense Breakdown</h3>
          <div className="divider" />
          <div className="flex items-center gap-8 budget-chart-wrap">
            <div className="chart-box" style={{ width: '300px', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface2)', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-center-label">
                <p className="text-xs text-text3">TOTAL</p>
                <p className="text-xl fw-800">${data.spent}</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-3">
              {pieData.map(item => (
                <div key={item.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="text-sm fw-600">${item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <h3>Budget Tips</h3>
            <div className="mt-4 flex flex-col gap-4">
              <div className="tip-item flex gap-3">
                <TrendingDown size={20} className="text-success" />
                <p className="text-xs text-text2">You're spending less on food than average for this region. Keep it up!</p>
              </div>
              <div className="tip-item flex gap-3">
                <CreditCard size={20} className="text-warning" />
                <p className="text-xs text-text2">Consider booking activities in advance to save up to 15% on entrance fees.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h3>Per Stop Analysis</h3>
        <div className="divider" />
        <table className="budget-table">
          <thead>
            <tr>
              <th>City</th>
              <th>Days</th>
              <th>Accomm.</th>
              <th>Transport</th>
              <th>Food</th>
              <th>Activities</th>
              <th>Daily Avg</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.per_stop.map(stop => (
              <tr key={stop.stop_id}>
                <td><p className="fw-600">{stop.city}</p><p className="text-xs text-text3">{stop.country}</p></td>
                <td>{stop.days}</td>
                <td>${stop.accommodation}</td>
                <td>${stop.transport}</td>
                <td>${stop.meals}</td>
                <td>${stop.activities}</td>
                <td><span className="badge badge-primary">${stop.per_day}</span></td>
                <td className="fw-700">${stop.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
