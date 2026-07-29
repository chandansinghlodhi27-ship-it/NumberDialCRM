import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CreateUserForm from './CreateUserForm'
import DeleteUserButton from './DeleteUserButton'
import { format } from 'date-fns'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Verify user is Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'Super_Admin') {
    redirect('/dashboard/leads')
  }

  // 2. Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // 3. Fetch analytics (how many leads added today by each user)
  // Get today's start date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: leadsToday } = await supabase
    .from('leads')
    .select('added_by')
    .gte('created_at', today.toISOString())

  // Calculate counts per user
  const leadsCountPerUser = leadsToday?.reduce((acc: Record<string, number>, lead) => {
    if (lead.added_by) {
      acc[lead.added_by] = (acc[lead.added_by] || 0) + 1
    }
    return acc
  }, {}) || {}

  return (
    <div className="p-4 sm:p-8 w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">Manage telecallers and view performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">Team Members</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mobile</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Added Today</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {profiles?.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{p.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {p.mobile_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          p.role === 'Super_Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {p.role === 'Super_Admin' ? 'Admin' : 'Telecaller'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                        {leadsCountPerUser[p.id] || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {p.id !== user.id && p.role !== 'Super_Admin' && (
                          <DeleteUserButton userId={p.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <CreateUserForm />
        </div>
      </div>
    </div>
  )
}
