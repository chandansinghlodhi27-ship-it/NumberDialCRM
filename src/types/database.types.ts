export type UserRole = 'Super_Admin' | 'Telecaller'

export interface Profile {
  id: string
  full_name: string
  mobile_number: string | null
  role: UserRole
  created_at: string
}

export interface Lead {
  id: string
  phone_number: string
  client_name: string
  status: string
  notes: string | null
  added_by: string | null
  created_at: string
}
