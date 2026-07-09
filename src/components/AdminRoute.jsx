import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './ui/LoadingSpinner'

export default function AdminRoute({ children }) {
  const { profile, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
