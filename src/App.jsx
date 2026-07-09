import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { XpProvider } from './contexts/XpContext'
import { PremiumProvider } from './contexts/PremiumContext'
import { SyncProvider } from './contexts/SyncContext'
import { NotificationProvider } from './contexts/NotificationContext'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import PageSkeleton from './components/ui/PageSkeleton'
import AdminRoute from './components/AdminRoute'

const Login = lazy(() => import('./pages/Login'))
const CreateProfile = lazy(() => import('./pages/CreateProfile'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Attendance = lazy(() => import('./pages/Attendance'))
const Internals = lazy(() => import('./pages/Internals'))
const CalendarPage = lazy(() => import('./pages/Calendar'))

const AiWorkspace = lazy(() => import('./pages/AiWorkspace'))
const NotesHub = lazy(() => import('./pages/NotesHub'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const Achievements = lazy(() => import('./pages/Achievements'))
const Admin = lazy(() => import('./pages/Admin'))
const Habits = lazy(() => import('./pages/Habits'))
const Tasks = lazy(() => import('./pages/Tasks'))
const Exams = lazy(() => import('./pages/Exams'))
const Grades = lazy(() => import('./pages/Grades'))
const Premium = lazy(() => import('./pages/Premium'))

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function ProfileGuard() {
  const { profile, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (profile === null) return <Navigate to="/create-profile" replace />
  return <Outlet />
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner className="min-h-screen" size={40} />

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/create-profile" element={<CreateProfile />} />
        </Route>
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route element={<ProfileGuard />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/internals" element={<Internals />} />
            <Route path="/calendar" element={<CalendarPage />} />

            <Route path="/ai" element={<AiWorkspace />} />
            <Route path="/notes" element={<NotesHub />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/premium" element={<Premium />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <XpProvider>
            <PremiumProvider>
              <SyncProvider>
              <NotificationProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px'
                  }
                }}
              />
              <AppRoutes />
              </NotificationProvider>
              </SyncProvider>
            </PremiumProvider>
          </XpProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
