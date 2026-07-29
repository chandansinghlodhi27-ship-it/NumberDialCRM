'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LogoutButton({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (isMobile) {
    return (
      <button onClick={handleLogout} disabled={loading} className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-50">
        <LogOut size={20} />
      </button>
    )
  }

  return (
    <button 
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
    >
      <LogOut className="mr-3 h-5 w-5" />
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
