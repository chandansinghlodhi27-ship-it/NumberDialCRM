'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Use Service Role Key to bypass RLS and use Admin API
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function createTelecaller(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const mobileNumber = formData.get('mobile_number') as string

  // 1. Create user in Supabase Auth via Admin API
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  const userId = authData.user.id

  // 2. Insert into profiles table
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      full_name: fullName,
      mobile_number: mobileNumber,
      email: email,
      raw_password: password,
      role: 'Telecaller',
    })

  if (profileError) {
    // Rollback user creation if profile fails
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return { error: profileError.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function deleteTelecaller(userId: string) {
  // Deleting from auth.users cascades to profiles table based on foreign key ON DELETE CASCADE
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}
