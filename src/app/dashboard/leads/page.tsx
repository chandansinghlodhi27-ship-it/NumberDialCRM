import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LeadsClient from './LeadsClient'
import type { Lead } from '@/types/database.types'

export default async function LeadsPage() {
  const supabase = await createClient()

  // 1. Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch user's profile to get role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'Telecaller'

  // 3. Fetch latest 500 leads to fix slowness (pagination can be added later)
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  // 4. Fetch profiles to map added_by to names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')

  const profilesMap: Record<string, string> = {}
  profiles?.forEach(p => {
    profilesMap[p.id] = p.full_name
  })

  // 5. Fetch global settings
  const { data: settings } = await supabase
    .from('settings')
    .select('whatsapp_message')
    .eq('id', 1)
    .single()

  const whatsappMessage = settings?.whatsapp_message || 'Hello, I am calling from NumberDial CRM.'

  return (
    <LeadsClient 
      leads={(leads || []) as Lead[]} 
      profilesMap={profilesMap}
      currentUserId={user.id}
      userRole={userRole}
      whatsappMessage={whatsappMessage}
    />
  )
}
