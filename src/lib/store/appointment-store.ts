import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
  insurance?: string;
  medicalHistory?: string[];
  emergencyContact?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  title: string;
  specialty: string;
  email: string;
  phone: string;
  schedule: {
    [day: string]: {
      start: string;
      end: string;
      breaks?: { start: string; end: string }[];
    };
  };
  isActive: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: 'preventive' | 'restorative' | 'cosmetic' | 'emergency' | 'surgical';
  isActive: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  serviceId: string;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  price?: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  reminderSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFilters {
  date?: string;
  providerId?: string;
  status?: Appointment['status'];
  patientSearch?: string;
}

// Store interface
interface AppointmentStore {
  // State
  appointments: Appointment[];
  patients: Patient[];
  providers: Provider[];
  services: Service[];
  selectedDate: Date;
  filters: AppointmentFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedDate: (date: Date) => void;
  setFilters: (filters: Partial<AppointmentFilters>) => void;

  // Appointment actions
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  // Patient actions
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;

  // Provider actions
  addProvider: (provider: Omit<Provider, 'id'>) => void;
  updateProvider: (id: string, updates: Partial<Provider>) => void;

  // Service actions
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, updates: Partial<Service>) => void;

  // Computed getters
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByProvider: (providerId: string) => Appointment[];
  getPatientById: (id: string) => Patient | undefined;
  getProviderById: (id: string) => Provider | undefined;
  getServiceById: (id: string) => Service | undefined;
  getTodayAppointments: () => Appointment[];
  getUpcomingAppointments: (days?: number) => Appointment[];

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;
}

// Default data
const defaultPatients: Patient[] = [
  {
    id: 'pat_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-03-15',
    address: '123 Main St, City, State 12345',
    insurance: 'Delta Dental - Plan #12345',
    medicalHistory: ['Hypertension', 'Allergic to Penicillin'],
    emergencyContact: 'John Johnson - (555) 987-6543',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 'pat_002',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    dateOfBirth: '1990-07-22',
    insurance: 'Cigna Health',
    medicalHistory: [],
    isActive: true,
    createdAt: '2024-06-15T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  }
];

const defaultProviders: Provider[] = [
  {
    id: 'prov_001',
    name: 'Dr. Sarah Smith',
    title: 'DDS, MS',
    specialty: 'General Dentistry',
    email: 'dr.smith@clinic.com',
    phone: '+1 (555) 111-2222',
    schedule: {
      monday: { start: '08:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
      tuesday: { start: '08:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
      wednesday: { start: '08:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
      thursday: { start: '08:00', end: '17:00', breaks: [{ start: '12:00', end: '13:00' }] },
      friday: { start: '08:00', end: '16:00', breaks: [{ start: '12:00', end: '13:00' }] }
    },
    isActive: true
  },
  {
    id: 'prov_002',
    name: 'Dr. Michael Johnson',
    title: 'DDS, PhD',
    specialty: 'Oral Surgery',
    email: 'dr.johnson@clinic.com',
    phone: '+1 (555) 333-4444',
    schedule: {
      monday: { start: '09:00', end: '18:00', breaks: [{ start: '12:30', end: '13:30' }] },
      tuesday: { start: '09:00', end: '18:00', breaks: [{ start: '12:30', end: '13:30' }] },
      thursday: { start: '09:00', end: '18:00', breaks: [{ start: '12:30', end: '13:30' }] },
      friday: { start: '09:00', end: '17:00', breaks: [{ start: '12:30', end: '13:30' }] }
    },
    isActive: true
  }
];

const defaultServices: Service[] = [
  {
    id: 'srv_001',
    name: 'Consultation & Exam',
    description: 'Comprehensive dental examination and consultation',
    duration: 60,
    price: 180,
    category: 'preventive',
    isActive: true
  },
  {
    id: 'srv_002',
    name: 'Professional Cleaning',
    description: 'Deep cleaning and plaque removal',
    duration: 90,
    price: 150,
    category: 'preventive',
    isActive: true
  },
  {
    id: 'srv_003',
    name: 'Crown Placement',
    description: 'Dental crown installation and fitting',
    duration: 180,
    price: 1200,
    category: 'restorative',
    isActive: true
  }
];

const defaultAppointments: Appointment[] = [
  {
    id: 'apt_001',
    patientId: 'pat_001',
    providerId: 'prov_001',
    serviceId: 'srv_001',
    date: new Date().toISOString().split('T')[0], // Today
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    notes: 'Regular checkup',
    price: 180,
    paymentStatus: 'pending',
    reminderSent: false,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  }
];

// Helper functions
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const today = () => new Date().toISOString().split('T')[0];

// Create store
export const useAppointmentStore = create<AppointmentStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        appointments: defaultAppointments,
        patients: defaultPatients,
        providers: defaultProviders,
        services: defaultServices,
        selectedDate: new Date(),
        filters: {},
        isLoading: false,
        error: null,

        // Actions
        setSelectedDate: (date) => set({ selectedDate: date }),

        setFilters: (filters) =>
          set((state) => ({ filters: { ...state.filters, ...filters } })),

        // Appointment actions
        addAppointment: (appointmentData) => {
          const appointment: Appointment = {
            id: generateId('apt'),
            ...appointmentData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          set((state) => ({
            appointments: [...state.appointments, appointment]
          }));
        },

        updateAppointment: (id, updates) =>
          set((state) => ({
            appointments: state.appointments.map((apt) =>
              apt.id === id
                ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
                : apt
            )
          })),

        deleteAppointment: (id) =>
          set((state) => ({
            appointments: state.appointments.filter((apt) => apt.id !== id)
          })),

        // Patient actions
        addPatient: (patientData) => {
          const patient: Patient = {
            id: generateId('pat'),
            ...patientData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          set((state) => ({
            patients: [...state.patients, patient]
          }));
        },

        updatePatient: (id, updates) =>
          set((state) => ({
            patients: state.patients.map((patient) =>
              patient.id === id
                ? { ...patient, ...updates, updatedAt: new Date().toISOString() }
                : patient
            )
          })),

        // Provider actions
        addProvider: (providerData) => {
          const provider: Provider = {
            id: generateId('prov'),
            ...providerData
          };

          set((state) => ({
            providers: [...state.providers, provider]
          }));
        },

        updateProvider: (id, updates) =>
          set((state) => ({
            providers: state.providers.map((provider) =>
              provider.id === id ? { ...provider, ...updates } : provider
            )
          })),

        // Service actions
        addService: (serviceData) => {
          const service: Service = {
            id: generateId('srv'),
            ...serviceData
          };

          set((state) => ({
            services: [...state.services, service]
          }));
        },

        updateService: (id, updates) =>
          set((state) => ({
            services: state.services.map((service) =>
              service.id === id ? { ...service, ...updates } : service
            )
          })),

        // Computed getters
        getAppointmentsByDate: (date) => {
          const { appointments } = get();
          return appointments.filter((apt) => apt.date === date);
        },

        getAppointmentsByProvider: (providerId) => {
          const { appointments } = get();
          return appointments.filter((apt) => apt.providerId === providerId);
        },

        getPatientById: (id) => {
          const { patients } = get();
          return patients.find((patient) => patient.id === id);
        },

        getProviderById: (id) => {
          const { providers } = get();
          return providers.find((provider) => provider.id === id);
        },

        getServiceById: (id) => {
          const { services } = get();
          return services.find((service) => service.id === id);
        },

        getTodayAppointments: () => {
          const { appointments } = get();
          return appointments.filter((apt) => apt.date === today());
        },

        getUpcomingAppointments: (days = 7) => {
          const { appointments } = get();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + days);
          const endDateStr = endDate.toISOString().split('T')[0];

          return appointments.filter((apt) =>
            apt.date >= today() && apt.date <= endDateStr
          ).sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            return dateCompare !== 0 ? dateCompare : a.startTime.localeCompare(b.startTime);
          });
        },

        // Utility actions
        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        resetStore: () => set({
          appointments: defaultAppointments,
          patients: defaultPatients,
          providers: defaultProviders,
          services: defaultServices,
          selectedDate: new Date(),
          filters: {},
          isLoading: false,
          error: null
        })
      }),
      {
        name: 'appointment-store',
        partialize: (state) => ({
          appointments: state.appointments,
          patients: state.patients,
          providers: state.providers,
          services: state.services,
          selectedDate: state.selectedDate,
          filters: state.filters
        })
      }
    ),
    { name: 'appointment-store' }
  )
);