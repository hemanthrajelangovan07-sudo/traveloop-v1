import { useState } from 'react'
import { useAuth } from '../AuthContext'
import api from '../api'
import { User, Mail, Globe, Lock, Trash2, Camera, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import './Profile.css'

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    language: user?.language || 'en',
    password: ''
  })

  const upd = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.put('/profile/', form)
      updateUser(data)
      toast.success('Profile updated successfully! ✨')
      setForm(f => ({ ...f, password: '' }))
    } catch (err) {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('This will deactivate your account. Are you sure?')) return
    try {
      await api.delete('/profile/')
      toast.success('Account deactivated')
      logout()
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>User <span className="gradient-text">Profile</span></h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-grid dash-grid mt-6">
        <div className="profile-main flex flex-col gap-6">
          <div className="card">
            <div className="flex items-center gap-6 mb-8">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                <button className="avatar-edit-btn"><Camera size={14}/></button>
              </div>
              <div>
                <h2>{user?.name}</h2>
                <p className="text-sm text-text2 flex items-center gap-1"><Mail size={12}/> {user?.email}</p>
                <div className="badge badge-primary mt-2">Member since {new Date(user?.created_at).getFullYear()}</div>
              </div>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="flex items-center gap-2 form-input">
                  <User size={18} className="text-text3" />
                  <input name="name" className="raw-input" value={form.name} onChange={upd} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <div className="flex items-center gap-2 form-input">
                    <Globe size={18} className="text-text3" />
                    <select name="language" className="raw-input" value={form.language} onChange={upd}>
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Change Password</label>
                  <div className="flex items-center gap-2 form-input">
                    <Lock size={18} className="text-text3" />
                    <input name="password" type="password" placeholder="New password" className="raw-input" value={form.password} onChange={upd} />
                  </div>
                </div>
              </div>
              <div className="divider" />
              <button type="submit" className="btn btn-primary ml-auto" disabled={loading}>
                {loading ? <span className="spinner" /> : <><Save size={18}/> Save Changes</>}
              </button>
            </form>
          </div>

          <div className="card border-accent/20">
            <h3 className="text-accent flex items-center gap-2"><Trash2 size={18}/> Danger Zone</h3>
            <p className="text-sm text-text2 mt-2">Deactivating your account will hide your profile and itineraries from other users. You can re-activate by logging in again.</p>
            <button className="btn btn-danger mt-4" onClick={deleteAccount}>Deactivate Account</button>
          </div>
        </div>

        <div className="profile-side flex flex-col gap-4">
          <div className="card">
            <h3>Account Info</h3>
            <div className="divider" />
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-text3">Role</span>
                <span className="fw-600 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text3">Account ID</span>
                <span className="text-xs text-text3">#TRV-{user?.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text3">Status</span>
                <span className="badge badge-success">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
