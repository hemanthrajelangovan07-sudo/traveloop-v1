import { useState, useEffect } from 'react'
import api from '../api'
import { Search, MapPin, TrendingUp, DollarSign, Globe, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import './CitySearch.css'

export default function CitySearch() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('')

  const fetchCities = async () => {
    setLoading(true)
    try {
      const url = `/cities/?${query ? `q=${query}&` : ''}${region ? `region=${region}` : ''}`
      const { data } = await api.get(url)
      setCities(data)
    } catch (err) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchCities, 300)
    return () => clearTimeout(timeout)
  }, [query, region])

  const regions = ['Europe', 'Asia', 'North America', 'South America', 'Middle East', 'Oceania']

  return (
    <div className="city-search">
      <div className="page-header">
        <h1>Explore <span className="gradient-text">Destinations</span></h1>
        <p>Discover world-class cities and their local travel costs</p>
      </div>

      <div className="search-controls card flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="form-group flex-1">
            <div className="flex items-center gap-2 form-input">
              <Search size={18} className="text-text3" />
              <input 
                type="text" 
                placeholder="Search by city or country..." 
                className="raw-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group w-64">
            <select className="form-input" value={region} onChange={e => setRegion(e.target.value)}>
              <option value="">All Regions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {regions.map(r => (
            <button key={r} className={`btn btn-sm ${region === r ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setRegion(region === r ? '' : r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="city-grid mt-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><div className="spinner" /></div>
        ) : cities.length > 0 ? (
          <div className="grid-4">
            {cities.map(city => (
              <div key={city.id} className="city-card card">
                <div className="city-card-img">
                  <img src={city.image_url} alt={city.name} />
                  <div className="city-popularity badge badge-accent2">
                    <TrendingUp size={12} /> {city.popularity}% Popular
                  </div>
                </div>
                <div className="city-card-info p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3>{city.name}</h3>
                      <p className="text-xs text-text2 flex items-center gap-1"><Globe size={10}/> {city.country}</p>
                    </div>
                    <div className="text-right">
                      <div className="badge badge-success">${city.avg_daily_cost}/day</div>
                    </div>
                  </div>
                  <p className="city-desc text-xs mt-3 text-text2 line-clamp-3">{city.description}</p>
                  
                  <div className="city-stats mt-4 flex justify-between pt-3 border-top">
                    <div className="text-xs">
                      <span className="text-text3 block">Cost Index</span>
                      <div className="progress-bar w-24 mt-1">
                        <div className="progress-fill bg-warning" style={{ width: `${city.cost_index}%` }} />
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-icon text-primary"><Plus size={18}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Globe size={60} />
            <h3>No results found</h3>
            <p>Try broadening your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
