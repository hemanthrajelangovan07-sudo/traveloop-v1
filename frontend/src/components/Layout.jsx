import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { Map, Home, Briefcase, Search, Activity, User, ShieldCheck, LogOut, Globe, Menu, X } from 'lucide-react'
import { useState } from 'react'
import './Layout.css'

const nav = [
  { to: '/', icon: Home, label: 'Dashboard', exact: true },
  { to: '/trips', icon: Briefcase, label: 'My Trips' },
  { to: '/cities', icon: Globe, label: 'Explore Cities' },
  { to: '/activities', icon: Activity, label: 'Activities' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Map size={28} style={{ color: 'var(--primary)' }} />
          <span>Traveloop</span>
        </div>
        <nav className="sidebar-nav">
          {nav.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
              <ShieldCheck size={18} /><span>Admin</span>
            </NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-role">{user?.role}</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      {/* Mobile overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
      {/* Main */}
      <main className="main-content">
        <div className="topbar">
          <button className="btn btn-ghost btn-icon mobile-menu" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <div className="topbar-right">
            <div className="user-avatar sm">{user?.name?.[0]?.toUpperCase()}</div>
          </div>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
