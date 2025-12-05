import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export type Database = {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          registration_number: string | null
          owner_id: string | null
          subscription_plan: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          registration_number?: string | null
          owner_id?: string | null
          subscription_plan?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          registration_number?: string | null
          owner_id?: string | null
          subscription_plan?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}