import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Phone, Users, LogOut, PhoneCall } from 'lucide-react'
import { logout } from './actions'
import type { Profile } from '@/types/database.types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userProfile = profile as Profile

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <PhoneCall className="text-blue-500 mr-2" size={24} />
          <span className="text-white font-bold text-lg tracking-wide">NumberDial</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/dashboard/leads" 
            className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Phone className="mr-3 h-5 w-5" />
            Leads Pool
          </Link>
          
          {userProfile?.role === 'Super_Admin' && (
            <Link 
              href="/dashboard/admin" 
              className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Users className="mr-3 h-5 w-5" />
              User Management
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-white">{userProfile?.full_name}</p>
            <p className="text-xs text-slate-500">{userProfile?.role === 'Super_Admin' ? 'Super Admin' : 'Telecaller'}</p>
          </div>
          <form action={logout}>
            <button 
              type="submit" 
              className="w-full flex items-center px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center">
            <PhoneCall className="text-blue-600 mr-2" size={24} />
            <span className="text-slate-900 font-bold text-lg">NumberDial</span>
          </div>
          <form action={logout}>
            <button type="submit" className="p-2 text-slate-500 hover:text-slate-700">
              <LogOut size={20} />
            </button>
          </form>
        </header>
        
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
