'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addLead(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const phoneNumber = formData.get('phone_number') as string
  const clientName = formData.get('client_name') as string
  const notes = formData.get('notes') as string

  // Clean phone number (optional: remove spaces, etc)
  const cleanPhone = phoneNumber.replace(/\s+/g, '')

  const { error } = await supabase
    .from('leads')
    .insert({
      phone_number: cleanPhone,
      client_name: clientName,
      notes: notes,
      added_by: user.id,
      status: 'New'
    })

  if (error) {
    // Handle unique constraint violation (Postgres code 23505)
    if (error.code === '23505') {
      return { error: 'This number is already in the system.' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/leads')
  return { success: true }
}
