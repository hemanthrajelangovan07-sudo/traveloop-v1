import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { Map, Eye, EyeOff, Plane } from 'lucide-react'
import toast from 'react-hot-toast'
import './Login.css'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const upd = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        toast.success('Welcome back! ✈️')
      } else {
        if (!form.name.trim()) return toast.error('Name is required')
        await register(form.name, form.email, form.password)
        toast.success('Account created! 🌍')
      }
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-blob b1" />
        <div className="login-blob b2" />
        <div className="login-blob b3" />
      </div>
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-icon"><Map size={28} /></div>
          <h1>Traveloop</h1>
          <p>Plan your perfect journey</p>
        </div>
        <div className="login-tabs">
          <button className={mode==='login'?'active':''} onClick={()=>setMode('login')}>Sign In</button>
          <button className={mode==='register'?'active':''} onClick={()=>setMode('register')}>Sign Up</button>
        </div>
        <form onSubmit={submit} className="login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" placeholder="Your full name" value={form.name} onChange={upd} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" name="email" type="email" placeholder="your@email.com" value={form.email} onChange={upd} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <input className="form-input" name="password" type={show?'text':'password'} placeholder="••••••••" value={form.password} onChange={upd} required />
              <button type="button" className="input-icon-btn" onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div>
          </div>
          {mode === 'login' && <div className="forgot-link"><a href="#">Forgot password?</a></div>}
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <span className="spinner" /> : <><Plane size={18}/>{mode==='login'?'Sign In':'Create Account'}</>}
          </button>
        </form>
        <div className="login-demo">
          <span>Demo: </span>
          <button onClick={()=>setForm({name:'',email:'demo@traveloop.com',password:'demo123'})}>Use Demo Account</button>
          <span> | Admin: </span>
          <button onClick={()=>setForm({name:'',email:'admin@traveloop.com',password:'admin123'})}>Use Admin</button>
        </div>
      </div>
    </div>
  )
}
