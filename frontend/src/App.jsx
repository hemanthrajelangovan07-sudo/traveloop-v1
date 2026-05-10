import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MyTrips from './pages/MyTrips'
import CreateTrip from './pages/CreateTrip'
import ItineraryBuilder from './pages/ItineraryBuilder'
import ItineraryView from './pages/ItineraryView'
import CitySearch from './pages/CitySearch'
import ActivitySearch from './pages/ActivitySearch'
import Budget from './pages/Budget'
import Checklist from './pages/Checklist'
import Notes from './pages/Notes'
import PublicTrip from './pages/PublicTrip'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import Layout from './components/Layout'

function PrivateRoute({ children, adminOnly }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/shared/:token" element={<PublicTrip />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="trips" element={<MyTrips />} />
        <Route path="trips/new" element={<CreateTrip />} />
        <Route path="trips/:id/edit" element={<CreateTrip />} />
        <Route path="trips/:id/build" element={<ItineraryBuilder />} />
        <Route path="trips/:id/view" element={<ItineraryView />} />
        <Route path="trips/:id/budget" element={<Budget />} />
        <Route path="trips/:id/checklist" element={<Checklist />} />
        <Route path="trips/:id/notes" element={<Notes />} />
        <Route path="cities" element={<CitySearch />} />
        <Route path="activities" element={<ActivitySearch />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid #313244' } }} />
      <AppRoutes />
    </AuthProvider>
  )
}
