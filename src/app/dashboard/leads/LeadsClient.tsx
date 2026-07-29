'use client'

import { useState, useEffect } from 'react'
import { format, isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from 'date-fns'
import type { Lead } from '@/types/database.types'
import { MessageCircle, Trash2, Download } from 'lucide-react'
import AddLeadModal from './AddLeadModal'
import { deleteLead } from './actions'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

interface LeadsClientProps {
  leads: Lead[]
  profilesMap: Record<string, string>
  currentUserId: string
  userRole: string
  whatsappMessage: string
}

export default function LeadsClient({ leads, profilesMap, currentUserId, userRole, whatsappMessage }: LeadsClientProps) {
  const [showMyLeadsOnly, setShowMyLeadsOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [telecallerFilter, setTelecallerFilter] = useState<string>('All')
  const [dateFilter, setDateFilter] = useState<string>('All')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  const handleDelete = async (leadId: string) => {
    if (!window.confirm("Are you sure you want to delete this lead? This cannot be undone.")) {
      return
    }

    setDeletingId(leadId)
    const result = await deleteLead(leadId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Lead deleted successfully")
    }
    setDeletingId(null)
  }

  const handleExport = () => {
    const exportData = filteredLeads.map(lead => ({
      'Date Added': format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm'),
      'Client Name': lead.client_name,
      'Phone Number': lead.phone_number,
      'Status': lead.status,
      'Notes': lead.notes || '',
      'Telecaller': lead.added_by ? profilesMap[lead.added_by] || 'Unknown' : 'Unknown',
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads')
    XLSX.writeFile(workbook, `Leads_Export_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`)
    toast.success('Export downloaded successfully!')
  }

  const filteredLeads = leads.filter(lead => {
    // 1. Filter by "My Leads"
    if (showMyLeadsOnly && lead.added_by !== currentUserId) {
      return false
    }
    // 2. Filter by Status
    if (statusFilter !== 'All' && lead.status !== statusFilter) {
      return false
    }
    // 3. Filter by Telecaller
    if (telecallerFilter !== 'All' && lead.added_by !== telecallerFilter) {
      return false
    }
    // 4. Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!lead.phone_number.toLowerCase().includes(q) && 
          !lead.client_name.toLowerCase().includes(q)) {
        return false
      }
    }
    // 5. Filter by Date
    if (dateFilter !== 'All') {
      const date = parseISO(lead.created_at)
      if (dateFilter === 'Today' && !isToday(date)) return false
      if (dateFilter === 'Yesterday' && !isYesterday(date)) return false
      if (dateFilter === 'This Week' && !isThisWeek(date)) return false
      if (dateFilter === 'This Month' && !isThisMonth(date)) return false
      
      if (dateFilter === 'Custom') {
        if (customStartDate && new Date(date).getTime() < new Date(customStartDate).setHours(0,0,0,0)) return false
        if (customEndDate && new Date(date).getTime() > new Date(customEndDate).setHours(23,59,59,999)) return false
      }
    }

    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Unique telecallers for the filter dropdown
  const telecallers = Array.from(new Set(leads.map(l => l.added_by))).filter(Boolean)

  // Reset to page 1 if search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, telecallerFilter, dateFilter, customStartDate, customEndDate, showMyLeadsOnly])

  return (
    <div className="p-4 sm:p-8 w-full space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads Pool</h1>
          <p className="mt-1 text-slate-600">View, search, and manage customer leads.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 bg-white shadow-sm cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
            <option value="Converted">Converted</option>
          </select>

          {/* Telecaller Filter */}
          <select 
            value={telecallerFilter}
            onChange={(e) => setTelecallerFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 bg-white shadow-sm cursor-pointer"
          >
            <option value="All">All Telecallers</option>
            {telecallers.map(id => (
              <option key={id} value={id as string}>{profilesMap[id as string] || 'Unknown'}</option>
            ))}
          </select>
          
          {/* Date Filter */}
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-700 bg-white shadow-sm cursor-pointer"
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Custom">Custom Date</option>
          </select>

          {dateFilter === 'Custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white" />
              <span className="text-slate-500">to</span>
              <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white" />
            </div>
          )}

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
          
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition-colors font-medium text-sm"
          >
            <Download size={18} className="mr-2" />
            Export to Excel
          </button>
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
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                      <a 
                        href={`https://wa.me/${lead.phone_number.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={20} />
                      </a>
                      
                      {userRole === 'Super_Admin' && (
                        <button
                          onClick={() => handleDelete(lead.id)}
                          disabled={deletingId === lead.id}
                          className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                          title="Delete Lead"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="text-sm text-slate-600">
              Showing <span className="font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)}</span> of <span className="font-semibold">{filteredLeads.length}</span> leads
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Simple logic to show near pages
                  let pageNum = currentPage - 2 + i
                  if (currentPage < 3) pageNum = i + 1
                  if (currentPage > totalPages - 2) pageNum = totalPages - 4 + i
                  if (pageNum < 1 || pageNum > totalPages) return null
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white' 
                          : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
