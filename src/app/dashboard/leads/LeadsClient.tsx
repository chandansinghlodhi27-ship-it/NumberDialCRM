'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import type { Lead } from '@/types/database.types'
import { MessageCircle } from 'lucide-react'
import AddLeadModal from './AddLeadModal'

interface LeadsClientProps {
  leads: Lead[]
  profilesMap: Record<string, string>
  currentUserId: string
}

export default function LeadsClient({ leads, profilesMap, currentUserId }: LeadsClientProps) {
  const [showMyLeadsOnly, setShowMyLeadsOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLeads = leads.filter(lead => {
    // 1. Filter by "My Leads"
    if (showMyLeadsOnly && lead.added_by !== currentUserId) {
      return false
    }
    // 2. Filter by search query (phone or name)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!lead.phone_number.toLowerCase().includes(q) && 
          !lead.client_name.toLowerCase().includes(q)) {
        return false
      }
    }
    return true
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads Pool</h1>
          <p className="mt-1 text-slate-600">View, search, and manage customer leads.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Toggle Switch */}
          <label className="flex items-center cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={showMyLeadsOnly}
                onChange={() => setShowMyLeadsOnly(!showMyLeadsOnly)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${showMyLeadsOnly ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showMyLeadsOnly ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-3 font-medium text-sm text-slate-700">
              My Leads
            </div>
          </label>
          
          <AddLeadModal />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b border-slate-200">
          <input
            type="text"
            placeholder="Search by phone or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="overflow-auto flex-1">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Added By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date Added</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{lead.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700">{lead.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500 truncate max-w-xs" title={lead.notes || ''}>
                        {lead.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700">
                        {lead.added_by ? profilesMap[lead.added_by] || 'Unknown' : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(lead.created_at), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a 
                        href={`https://wa.me/${lead.phone_number.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={20} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
