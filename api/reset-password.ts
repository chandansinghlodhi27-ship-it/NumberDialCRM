import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { userId, newPassword } = req.body

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  )

  if (authError) return res.status(400).json({ error: authError.message })

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ raw_password: newPassword })
    .eq('id', userId)

  if (profileError) return res.status(400).json({ error: profileError.message })

  return res.status(200).json({ success: true })
}
