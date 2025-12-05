// Offline database functionality disabled for build compatibility
// import initSqlJs, { Database } from 'sql.js'

let db: any = null

export async function initDatabase() {
  if (typeof window === 'undefined') return null

  // SQL.js integration disabled for production build
  // Will be re-enabled with proper bundling configuration
  console.warn('Offline database not available in production build')
  return null
}

async function createTables() {
  if (!db) return

  const schema = `
    -- Clinics table
    CREATE TABLE IF NOT EXISTS clinics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      owner_id TEXT,
      subscription_plan TEXT DEFAULT 'basic',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending'
    );

    -- User profiles table
    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      clinic_id TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      position TEXT,
      role TEXT DEFAULT 'staff',
      commission_rate REAL,
      basic_pay REAL,
      specialization TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      FOREIGN KEY (clinic_id) REFERENCES clinics (id)
    );

    -- Patients table
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      clinic_id TEXT,
      patient_number TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      date_of_birth TEXT,
      gender TEXT,
      address TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      medical_history TEXT,
      dental_history TEXT,
      allergies TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      FOREIGN KEY (clinic_id) REFERENCES clinics (id)
    );

    -- Services table
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      clinic_id TEXT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      base_price REAL NOT NULL,
      promo_price REAL,
      duration INTEGER DEFAULT 60,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      FOREIGN KEY (clinic_id) REFERENCES clinics (id)
    );

    -- Appointments table
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      clinic_id TEXT,
      patient_id TEXT,
      dentist_id TEXT,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      duration INTEGER DEFAULT 60,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      total_amount REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      FOREIGN KEY (clinic_id) REFERENCES clinics (id),
      FOREIGN KEY (patient_id) REFERENCES patients (id),
      FOREIGN KEY (dentist_id) REFERENCES user_profiles (id)
    );

    -- Appointment services junction table
    CREATE TABLE IF NOT EXISTS appointment_services (
      id TEXT PRIMARY KEY,
      appointment_id TEXT,
      service_id TEXT,
      quantity INTEGER DEFAULT 1,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      FOREIGN KEY (appointment_id) REFERENCES appointments (id),
      FOREIGN KEY (service_id) REFERENCES services (id)
    );

    -- Transactions table
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      clinic_id TEXT,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT,
      reference_number TEXT,
      description TEXT,
      transaction_date TEXT NOT NULL,
      appointment_id TEXT,
      staff_id TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      FOREIGN KEY (clinic_id) REFERENCES clinics (id),
      FOREIGN KEY (appointment_id) REFERENCES appointments (id),
      FOREIGN KEY (staff_id) REFERENCES user_profiles (id)
    );

    -- Inventory table
    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      clinic_id TEXT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      unit TEXT NOT NULL,
      cost_per_unit REAL NOT NULL,
      supplier TEXT,
      expiry_date TEXT,
      minimum_stock INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      FOREIGN KEY (clinic_id) REFERENCES clinics (id)
    );

    -- Staff salaries table
    CREATE TABLE IF NOT EXISTS staff_salaries (
      id TEXT PRIMARY KEY,
      clinic_id TEXT,
      staff_id TEXT,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      basic_pay REAL DEFAULT 0,
      commission REAL DEFAULT 0,
      bonuses REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      total_pay REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      sync_status TEXT DEFAULT 'pending',
      FOREIGN KEY (clinic_id) REFERENCES clinics (id),
      FOREIGN KEY (staff_id) REFERENCES user_profiles (id)
    );
  `

  db.exec(schema)
  saveDatabase()
}

export function saveDatabase() {
  if (!db) return

  const data = db.export()
  const dataArray = Array.from(data)
  localStorage.setItem('dentalSaasDB', JSON.stringify(dataArray))
}

export function executeQuery(query: string, params: any[] = []) {
  if (!db) return null

  try {
    const stmt = db.prepare(query)
    const result = stmt.getAsObject(params)
    stmt.free()
    saveDatabase()
    return result
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

export function executeQueryAll(query: string, params: any[] = []) {
  if (!db) return []

  try {
    const stmt = db.prepare(query)
    const results = []
    while (stmt.step()) {
      results.push(stmt.getAsObject())
    }
    stmt.free()
    return results
  } catch (error) {
    console.error('Database query error:', error)
    return []
  }
}

export async function syncToSupabase() {
  // This function will sync offline data to Supabase
  // Implementation depends on specific sync strategy
  if (!db) return

  const pendingRecords = executeQueryAll(`
    SELECT 'patients' as table_name, * FROM patients WHERE sync_status = 'pending'
    UNION ALL
    SELECT 'appointments' as table_name, * FROM appointments WHERE sync_status = 'pending'
    UNION ALL
    SELECT 'transactions' as table_name, * FROM transactions WHERE sync_status = 'pending'
  `)

  console.log('Pending sync records:', pendingRecords)
  // Implement actual sync logic here
}

export async function isOnline(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false
  return navigator.onLine
}