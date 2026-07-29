import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Phone, Users, LogOut, PhoneCall, Settings } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'

export default function Layout({ session }: { session: any }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (session?.user?.id) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => setProfile(data))
    }
  }, [session])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20 shrink-0">
        <div className="p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 text-white mb-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-inner">
              <PhoneCall size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">NumberDial</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">CRM System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link 
            to="/dashboard/leads" 
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              location.pathname === '/dashboard/leads' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Phone className="mr-3 h-5 w-5" />
            Leads Pool
          </Link>
          
          {profile?.role === 'Super_Admin' && (
            <>
              <Link 
                to="/dashboard/admin" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/dashboard/admin' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="mr-3 h-5 w-5" />
                User Management
              </Link>
              <Link 
                to="/dashboard/settings" 
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/dashboard/settings' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                System Settings
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-sm font-medium text-white truncate">{profile?.full_name || 'Loading...'}</div>
              <div className="text-xs text-slate-500 truncate">{session?.user?.email}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <Outlet context={{ profile, session }} />
      </main>
    </div>
  )
}
