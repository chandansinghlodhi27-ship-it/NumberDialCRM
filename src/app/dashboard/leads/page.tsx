import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LeadsClient from './LeadsClient'
import type { Lead } from '@/types/database.types'

export default async function LeadsPage() {
  const supabase = await createClient()

  // 1. Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch all leads
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  // 3. Fetch profiles to map added_by to names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')

  const profilesMap: Record<string, string> = {}
  profiles?.forEach(p => {
    profilesMap[p.id] = p.full_name
  })

  return (
    <LeadsClient 
      leads={(leads || []) as Lead[]} 
      profilesMap={profilesMap}
      currentUserId={user.id}
    />
  )
}
