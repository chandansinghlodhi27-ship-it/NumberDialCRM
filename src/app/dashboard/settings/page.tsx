import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
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

  // 2. Fetch current settings (id=1)
  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  const defaultMessage = settings?.whatsapp_message || 'Hello, I am calling from NumberDial CRM.'

  return (
    <div className="p-4 sm:p-8 w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="mt-2 text-slate-600">Configure global settings for NumberDial CRM.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <SettingsForm defaultMessage={defaultMessage} />
      </div>
    </div>
  )
}
