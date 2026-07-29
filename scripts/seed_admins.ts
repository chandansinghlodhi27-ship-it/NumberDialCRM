import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!)

const admins = [
  { email: 'chandansinghlodhi27@gmail.com', name: 'Chandan Singh' },
  { email: 'rajeshrshiv@gmail.com', name: 'Rajesh Shiv' },
]

async function seedAdmins() {
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
  
  if (listError) {
    console.error("Error listing users:", listError.message)
    return
  }

  for (const admin of admins) {
    const user = users.find(u => u.email === admin.email)
    if (user) {
      console.log(`Found existing user ${admin.email} with ID ${user.id}`)
      
      // Upsert into profiles
      const { error: upsertError } = await supabaseAdmin.from('profiles').upsert({
        id: user.id,
        full_name: admin.name,
        mobile_number: '',
        role: 'Super_Admin'
      })
      
      if (upsertError) {
        console.error(`Failed to upsert profile for ${admin.email}:`, upsertError.message)
      } else {
        console.log(`Successfully set ${admin.email} as Super_Admin!`)
      }
    } else {
      console.log(`User ${admin.email} not found in Auth.`)
    }
  }
}

seedAdmins().then(() => console.log('Done!'))
