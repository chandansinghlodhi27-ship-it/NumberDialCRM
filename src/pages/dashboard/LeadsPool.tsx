import { useState, useEffect } from 'react'
import { format, isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from 'date-fns'
import { MessageCircle, Trash2, Download, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase'
import { useOutletContext } from 'react-router-dom'

export default function LeadsPool() {
  const { profile, session } = useOutletContext<any>()
  const [leads, setLeads] = useState<any[]>([])
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({})
  const [whatsappMessage, setWhatsappMessage] = useState('Hello, I am calling from NumberDial CRM.')
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [showMyLeadsOnly, setShowMyLeadsOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [telecallerFilter, setTelecallerFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const [leadsRes, profilesRes, settingsRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name'),
      supabase.from('settings').select('whatsapp_message').eq('id', 1).single()
    ])

    if (leadsRes.data) setLeads(leadsRes.data)
    
    if (profilesRes.data) {
      const map: Record<string, string> = {}
      profilesRes.data.forEach(p => map[p.id] = p.full_name)
      setProfilesMap(map)
    }

    if (settingsRes.data) {
      setWhatsappMessage(settingsRes.data.whatsapp_message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, telecallerFilter, dateFilter, customStartDate, customEndDate, showMyLeadsOnly])

  const handleDelete = async (leadId: string) => {
    if (!window.confirm("Are you sure you want to delete this lead? This cannot be undone.")) return
    
    const { error } = await supabase.from('leads').delete().eq('id', leadId)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Lead deleted successfully")
      setLeads(leads.filter(l => l.id !== leadId))
    }
  }

  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setModalLoading(true)
    const formData = new FormData(e.currentTarget)
    const phone = formData.get('phone_number') as string
    
    const { error } = await supabase.from('leads').insert({
      phone_number: phone,
      client_name: formData.get('client_name') as string,
      notes: formData.get('notes') as string,
      added_by: session.user.id
    })

    setModalLoading(false)
    if (error) {
      if (error.code === '23505') {
        toast.error('This number is already in the system.')
      } else {
        toast.error(error.message)
      }
    } else {
      toast.success('Lead added successfully')
      setIsModalOpen(false)
      fetchData()
    }
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
    if (showMyLeadsOnly && lead.added_by !== session?.user?.id) return false
    if (statusFilter !== 'All' && lead.status !== statusFilter) return false
    if (telecallerFilter !== 'All' && lead.added_by !== telecallerFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!lead.phone_number.toLowerCase().includes(q) && !lead.client_name.toLowerCase().includes(q)) return false
    }
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

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const telecallers = Array.from(new Set(leads.map(l => l.added_by))).filter(Boolean)

  if (loading) return <div className="p-8">Loading leads...</div>

  return (
    <div className="p-4 sm:p-8 w-full space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads Pool</h1>
          <p className="mt-1 text-slate-600">View, search, and manage customer leads.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg text-sm bg-white cursor-pointer">
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
            <option value="Converted">Converted</option>
          </select>

          <select value={telecallerFilter} onChange={(e) => setTelecallerFilter(e.target.value)} className="px-4 py-2 border rounded-lg text-sm bg-white cursor-pointer">
            <option value="All">All Telecallers</option>
            {telecallers.map(id => <option key={id} value={id}>{profilesMap[id] || 'Unknown'}</option>)}
          </select>
          
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-4 py-2 border rounded-lg text-sm bg-white cursor-pointer">
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Custom">Custom Date</option>
          </select>

          {dateFilter === 'Custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm bg-white" />
              <span>to</span>
              <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm bg-white" />
            </div>
          )}

          <label className="flex items-center cursor-pointer bg-white px-4 py-2 rounded-lg border">
            <input type="checkbox" className="mr-2" checked={showMyLeadsOnly} onChange={() => setShowMyLeadsOnly(!showMyLeadsOnly)} />
            <span className="text-sm font-medium">My Leads</span>
          </label>
          
          <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus size={18} className="mr-2" /> Add Lead
          </button>
          
          <button onClick={handleExport} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
            <Download size={18} className="mr-2" /> Export
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Add New Lead</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input required name="phone_number" type="tel" pattern="[0-9]{10}" maxLength={10} className="w-full px-3 py-2 border rounded-lg" placeholder="9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client Name *</label>
                <input required name="client_name" type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea name="notes" rows={3} className="w-full px-3 py-2 border rounded-lg resize-none" placeholder="Optional notes..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={modalLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg">{modalLoading ? 'Saving...' : 'Save Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b"><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full max-w-md px-4 py-2 border rounded-lg" /></div>
        <div className="overflow-auto flex-1">
          <table className="min-w-full divide-y">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Added By</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{lead.phone_number}</td>
                  <td className="px-6 py-4">{lead.client_name}</td>
                  <td className="px-6 py-4"><span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">{lead.status}</span></td>
                  <td className="px-6 py-4">{profilesMap[lead.added_by] || 'Unknown'}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <a href={`https://wa.me/${lead.phone_number.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" className="p-2 text-green-600 hover:bg-green-50 rounded-full"><MessageCircle size={20} /></a>
                    {profile?.role === 'Super_Admin' && (
                      <button onClick={() => handleDelete(lead.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={20} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between bg-slate-50">
            <div className="text-sm text-slate-600">Showing page {currentPage} of {totalPages}</div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border rounded text-sm disabled:opacity-50">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border rounded text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
