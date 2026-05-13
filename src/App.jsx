import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useTheme } from './hooks/useTheme'
import { useChatStore } from './store/chatStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProjectPage from './pages/ProjectPage'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import ChatPanel from './components/chat/ChatPanel'
import ChatButton from './components/chat/ChatButton'

export default function App() {
  const { initAuth, user } = useAuthStore()
  const { theme } = useTheme()
  const { initDMSubscription, loadUnreadCounts } = useChatStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  useEffect(() => {
    if (user) {
      initDMSubscription(user.id)
      loadUnreadCounts(user.id)
    }
  }, [user?.id])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:projectId" element={<ProjectPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
      <ChatPanel />
      <ChatButton />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 3000,
        }}
      />
    </>
  )
}
