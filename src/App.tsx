import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

// Pages
import Login from './pages/Login'
import Layout from './pages/dashboard/Layout'
import LeadsPool from './pages/dashboard/LeadsPool'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import SettingsPage from './pages/dashboard/SettingsPage'
import Home from './pages/Home'

function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard/leads" />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={session ? <Layout session={session} /> : <Navigate to="/login" />}
        >
          <Route path="leads" element={<LeadsPool session={session} />} />
          <Route path="admin" element={<AdminDashboard session={session} />} />
          <Route path="settings" element={<SettingsPage session={session} />} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
