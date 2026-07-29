import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { MessageCircle } from 'lucide-react'
import { useOutletContext, Navigate } from 'react-router-dom'

export default function SettingsPage() {
  const { profile } = useOutletContext<any>()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    supabase.from('settings').select('whatsapp_message').eq('id', 1).single().then(({ data }) => {
      if (data) setMessage(data.whatsapp_message)
      setFetching(false)
    })
  }, [])

  if (profile?.role !== 'Super_Admin') {
    return <Navigate to="/dashboard/leads" />
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('settings').update({ whatsapp_message: message }).eq('id', 1)
    setLoading(false)
    
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Settings saved successfully!')
    }
  }

  return (
    <div className="p-4 sm:p-8 w-full max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="mt-2 text-slate-600">Manage global configuration for your CRM.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg">
            <MessageCircle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">WhatsApp Defaults</h2>
            <p className="text-sm text-slate-500">Configure the pre-filled message for telecallers.</p>
          </div>
        </div>

        {fetching ? (
          <div className="p-6">Loading...</div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Default Message Template</label>
              <textarea 
                required 
                name="whatsapp_message" 
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow resize-none bg-slate-50 focus:bg-white" 
              />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all">
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
