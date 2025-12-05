export interface User {
  id: string
  email: string
  role: 'admin' | 'dentist' | 'staff'
  profile?: UserProfile
}

export interface UserProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  phone?: string
  clinic_name: string
  position?: string
  commission_rate?: number
  basic_pay?: number
  specialization?: string
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  clinic_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  address?: string
  emergency_contact?: string
  medical_history?: string
  dental_history?: string
  calcom_user_id?: number
  calcom_access_token?: string
  calcom_refresh_token?: string
  calcom_token_expires_at?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  dentist_id?: string
  service_ids: string[]
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  total_amount: number
  created_at: string
  updated_at: string
  patient?: Patient
  dentist?: UserProfile
  services?: Service[]
}

export interface Service {
  id: string
  clinic_id: string
  name: string
  category: string
  base_price: number
  promo_price?: number
  duration: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DentistRate {
  id: string
  clinic_id: string
  dentist_id: string
  service_category: string
  commission_percentage?: number
  flat_rate?: number
  basic_daily_rate?: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  clinic_id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  payment_method?: 'cash' | 'gcash' | 'maya' | 'card' | 'bank_transfer'
  reference_number?: string
  description?: string
  date: string
  appointment_id?: string
  staff_id?: string
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  clinic_id: string
  name: string
  category: 'dental_supplies' | 'office_supplies' | 'consumables'
  quantity: number
  unit: string
  cost_per_unit: number
  supplier?: string
  expiry_date?: string
  minimum_stock: number
  created_at: string
  updated_at: string
}

export interface StaffSalary {
  id: string
  clinic_id: string
  staff_id: string
  period_start: string
  period_end: string
  basic_pay: number
  commission: number
  deductions: number
  total_pay: number
  status: 'pending' | 'paid'
  created_at: string
  updated_at: string
}

export interface Clinic {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  registration_number?: string
  owner_id: string
  subscription_plan: 'basic' | 'pro' | 'enterprise'
  is_active: boolean
  created_at: string
  updated_at: string
}