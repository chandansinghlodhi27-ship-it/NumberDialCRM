'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Verify user is a Super_Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'Super_Admin') {
    return { error: 'Unauthorized: Only Super Admins can update settings.' }
  }

  const whatsappMessage = formData.get('whatsapp_message') as string

  // 2. Upsert the setting (always id=1)
  const { error } = await supabase
    .from('settings')
    .upsert({ 
      id: 1, 
      whatsapp_message: whatsappMessage,
      updated_at: new Date().toISOString()
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/leads')
  revalidatePath('/dashboard/settings')
  return { success: true }
}
