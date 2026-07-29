'use client'

import { useState } from 'react'
import { updateSettings } from './actions'
import toast from 'react-hot-toast'
import { MessageCircle } from 'lucide-react'

export default function SettingsForm({ defaultMessage }: { defaultMessage: string }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const result = await updateSettings(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Settings updated successfully')
    }
  }

  return (
    <form action={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
          <MessageCircle size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">WhatsApp Template</h3>
          <p className="text-sm text-slate-500">Configure the default pre-filled message for WhatsApp.</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Default Message
          </label>
          <textarea 
            required 
            name="whatsapp_message" 
            defaultValue={defaultMessage}
            rows={5}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm resize-y" 
            placeholder="e.g. Hello! I am calling from NumberDial CRM. Are you interested in our services?"
          />
          <p className="mt-2 text-sm text-slate-500">
            This message will automatically appear in the chat box when a Telecaller clicks the WhatsApp icon next to a lead.
          </p>
        </div>
        
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}
