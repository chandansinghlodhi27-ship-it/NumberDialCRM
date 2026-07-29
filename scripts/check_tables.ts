import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl!, serviceRoleKey!)

async function checkTables() {
  const { error: profileError } = await supabaseAdmin.from('profiles').select('*').limit(1)
  console.log("Profiles Table Error:", profileError?.message || 'EXISTS')
  
  const { error: leadsError } = await supabaseAdmin.from('leads').select('*').limit(1)
  console.log("Leads Table Error:", leadsError?.message || 'EXISTS')
}

checkTables()
