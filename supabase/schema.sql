-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clinics table (multi-tenant)
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  registration_number TEXT,
  owner_id UUID,
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro', 'enterprise')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'dentist', 'staff')),
  commission_rate DECIMAL(5,2),
  basic_pay DECIMAL(10,2),
  specialization TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, clinic_id)
);

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  patient_number TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history TEXT,
  dental_history TEXT,
  allergies TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinic_id, patient_number)
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  promo_price DECIMAL(10,2),
  duration INTEGER DEFAULT 60, -- in minutes
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dentist rates table
CREATE TABLE dentist_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  dentist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  service_category TEXT,
  commission_percentage DECIMAL(5,2),
  flat_rate DECIMAL(10,2),
  basic_daily_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinic_id, dentist_id, service_category)
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id UUID REFERENCES user_profiles(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  total_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointment services junction table
CREATE TABLE appointment_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (for income and expenses)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'gcash', 'maya', 'card', 'bank_transfer')),
  reference_number TEXT,
  description TEXT,
  transaction_date DATE NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  staff_id UUID REFERENCES user_profiles(id),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('dental_supplies', 'office_supplies', 'consumables')),
  quantity INTEGER DEFAULT 0,
  unit TEXT NOT NULL,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  supplier TEXT,
  expiry_date DATE,
  minimum_stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff salary records
CREATE TABLE staff_salaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  basic_pay DECIMAL(10,2) DEFAULT 0,
  commission DECIMAL(10,2) DEFAULT 0,
  bonuses DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  total_pay DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_clinic_id ON user_profiles(clinic_id);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_dentist_id ON appointments(dentist_id);
CREATE INDEX idx_transactions_clinic_id ON transactions(clinic_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_inventory_clinic_id ON inventory_items(clinic_id);
CREATE INDEX idx_staff_salaries_clinic_id ON staff_salaries(clinic_id);

-- Row Level Security (RLS) policies
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentist_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_salaries ENABLE ROW LEVEL SECURITY;

-- Clinic policies
CREATE POLICY "Users can view their own clinic" ON clinics
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND clinic_id = clinics.id)
  );

-- User profiles policies
CREATE POLICY "Users can view profiles in their clinic" ON user_profiles
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.clinic_id = user_profiles.clinic_id)
  );

-- Patients policies
CREATE POLICY "Users can access patients in their clinic" ON patients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND clinic_id = patients.clinic_id)
  );

-- Services policies
CREATE POLICY "Users can access services in their clinic" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND clinic_id = services.clinic_id)
  );

-- Appointments policies
CREATE POLICY "Users can access appointments in their clinic" ON appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND clinic_id = appointments.clinic_id)
  );

-- Other table policies follow similar pattern
CREATE POLICY "Users can access data in their clinic" ON dentist_rates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND clinic_id = dentist_rates.clinic_id)
  );

CREATE POLICY "Users can access data in their clinic" ON appointment_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM appointments a
             JOIN user_profiles up ON up.clinic_id = a.clinic_id
             WHERE up.user_id = auth.uid() AND a.id = appointment_services.appointment_id)
  );

CREATE POLICY "Users can access data in their clinic" ON transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND clinic_id = transactions.clinic_id)
  );

CREATE POLICY "Users can access data in their clinic" ON inventory_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND clinic_id = inventory_items.clinic_id)
  );

CREATE POLICY "Users can access data in their clinic" ON staff_salaries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND clinic_id = staff_salaries.clinic_id)
  );

-- Functions to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dentist_rates_updated_at BEFORE UPDATE ON dentist_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_salaries_updated_at BEFORE UPDATE ON staff_salaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();