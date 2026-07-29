import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { full_name, email, mobile_number, password } = req.body

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) return res.status(400).json({ error: authError.message })

  const userId = authData.user.id

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      full_name,
      mobile_number,
      email,
      raw_password: password,
      role: 'Telecaller',
    })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return res.status(400).json({ error: profileError.message })
  }

  return res.status(200).json({ success: true })
}
