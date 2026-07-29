import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Users, Trash2, KeyRound, UserPlus, X } from 'lucide-react'
import { useOutletContext, Navigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { profile, session } = useOutletContext<any>()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState<string | null>(null)
  
  // Forms
  const [formData, setFormData] = useState({ full_name: '', email: '', mobile_number: '', password: '' })
  const [newPassword, setNewPassword] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setUsers(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (profile?.role !== 'Super_Admin') {
    return <Navigate to="/dashboard/leads" />
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const res = await fetch('/api/create-telecaller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to create user')
      
      toast.success('User created successfully')
      setIsAddOpen(false)
      setFormData({ full_name: '', email: '', mobile_number: '', password: '' })
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure?")) return
    const res = await fetch(`/api/delete-telecaller`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    if (res.ok) {
      toast.success('User deleted')
      fetchUsers()
    } else {
      const d = await res.json()
      toast.error(d.error || 'Failed to delete')
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isResetOpen) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: isResetOpen, newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reset')
      
      toast.success('Password reset successfully')
      setIsResetOpen(null)
      setNewPassword('')
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 w-full max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="mt-2 text-slate-600">Create and manage Telecallers.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          <UserPlus size={18} className="mr-2" /> Add Telecaller
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Password</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{u.full_name}</td>
                  <td className="px-6 py-4">{u.mobile_number}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4 font-mono">{u.raw_password}</td>
                  <td className="px-6 py-4 text-right">
                    {u.id !== session?.user?.id && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setIsResetOpen(u.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><KeyRound size={18}/></button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={18}/></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b"><h2 className="text-xl font-bold">Add Telecaller</h2><button onClick={() => setIsAddOpen(false)}><X size={24} /></button></div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <input required type="text" placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input required type="tel" pattern="[0-9]{10}" maxLength={10} placeholder="10-digit Mobile" value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input required type="text" minLength={6} placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <button type="submit" disabled={actionLoading} className="w-full py-2 bg-blue-600 text-white rounded-lg">{actionLoading ? 'Creating...' : 'Create Telecaller'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b"><h2 className="text-xl font-bold">Reset Password</h2><button onClick={() => setIsResetOpen(null)}><X size={24} /></button></div>
            <form onSubmit={handleReset} className="p-6 space-y-4">
              <input required type="text" minLength={6} placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              <button type="submit" disabled={actionLoading} className="w-full py-2 bg-blue-600 text-white rounded-lg">{actionLoading ? 'Saving...' : 'Save Password'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
