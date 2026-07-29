import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const admins = [
  { email: 'chandansinghlodhi27@gmail.com', name: 'Chandan Singh' },
  { email: 'rajeshrshiv@gmail.com', name: 'Rajesh Shiv' },
]

async function seedAdmins() {
  for (const admin of admins) {
    console.log(`Creating user: ${admin.email}...`)
    
    // 1. Create User in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: admin.email,
      password: 'Admin@1234', // Temporary password
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`User ${admin.email} already exists.`)
        // Try to update role to Super_Admin if they already exist
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const user = existingUsers.users.find(u => u.email === admin.email)
        
        if (user) {
           await supabaseAdmin.from('profiles').update({ role: 'Super_Admin' }).eq('id', user.id)
           console.log(`Updated ${admin.email} to Super_Admin.`)
        }
        continue
      } else {
        console.error(`Error creating user ${admin.email}:`, authError.message)
        continue
      }
    }

    const userId = authData.user.id

    // 2. Insert into Profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      full_name: admin.name,
      mobile_number: '',
      role: 'Super_Admin',
    })

    if (profileError) {
      console.error(`Error creating profile for ${admin.email}:`, profileError.message)
    } else {
      console.log(`Successfully created Super Admin: ${admin.email}`)
    }
  }
}

seedAdmins().then(() => console.log('Done!'))
