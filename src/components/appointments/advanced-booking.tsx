'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Zap,
  Users,
  Stethoscope,
  Heart,
  Shield,
  Star,
  Plus,
  X,
  Check,
  ArrowRight,
  CalendarDays,
  Timer,
  DollarSign,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Types
interface Provider {
  id: string;
  name: string;
  title: string;
  specialty: string;
  avatar: string;
  rating: number;
  experience: number;
  languages: string[];
  nextAvailable: string;
  pricing: {
    consultation: number;
    cleaning: number;
    emergency: number;
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: 'preventive' | 'restorative' | 'cosmetic' | 'emergency' | 'surgical';
  icon: any;
  color: string;
  popular?: boolean;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  provider: string;
  price?: number;
  emergency?: boolean;
}

interface AppointmentForm {
  service: Service | null;
  provider: Provider | null;
  date: Date | null;
  time: TimeSlot | null;
  patient: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    isNewPatient: boolean;
    insurance: string;
    emergencyContact: string;
    medicalHistory: string[];
  };
  notes: string;
  paymentMethod: 'insurance' | 'cash' | 'card' | 'financing';
}

// Mock data
const mockProviders: Provider[] = [
  {
    id: 'dr_smith',
    name: 'Dr. Sarah Smith',
    title: 'DDS, MS',
    specialty: 'General Dentistry',
    avatar: '/avatars/dr_smith.jpg',
    rating: 4.9,
    experience: 12,
    languages: ['English', 'Spanish'],
    nextAvailable: '2025-01-03 09:00',
    pricing: { consultation: 180, cleaning: 150, emergency: 300 }
  },
  {
    id: 'dr_johnson',
    name: 'Dr. Michael Johnson',
    title: 'DDS, PhD',
    specialty: 'Oral Surgery',
    avatar: '/avatars/dr_johnson.jpg',
    rating: 4.8,
    experience: 15,
    languages: ['English', 'French'],
    nextAvailable: '2025-01-03 14:00',
    pricing: { consultation: 250, cleaning: 180, emergency: 450 }
  },
  {
    id: 'dr_martinez',
    name: 'Dr. Ana Martinez',
    title: 'DDS',
    specialty: 'Cosmetic Dentistry',
    avatar: '/avatars/dr_martinez.jpg',
    rating: 4.9,
    experience: 8,
    languages: ['English', 'Spanish', 'Portuguese'],
    nextAvailable: '2025-01-04 10:30',
    pricing: { consultation: 200, cleaning: 160, emergency: 350 }
  }
];

const mockServices: Service[] = [
  {
    id: 'consultation',
    name: 'Consultation & Exam',
    description: 'Comprehensive dental examination and consultation',
    duration: 60,
    price: 180,
    category: 'preventive',
    icon: Stethoscope,
    color: 'blue',
    popular: true
  },
  {
    id: 'cleaning',
    name: 'Professional Cleaning',
    description: 'Deep cleaning and plaque removal',
    duration: 90,
    price: 150,
    category: 'preventive',
    icon: Heart,
    color: 'green',
    popular: true
  },
  {
    id: 'whitening',
    name: 'Teeth Whitening',
    description: 'Professional teeth whitening treatment',
    duration: 120,
    price: 450,
    category: 'cosmetic',
    icon: Star,
    color: 'yellow'
  },
  {
    id: 'crown',
    name: 'Crown Placement',
    description: 'Dental crown installation and fitting',
    duration: 180,
    price: 1200,
    category: 'restorative',
    icon: Shield,
    color: 'purple'
  },
  {
    id: 'emergency',
    name: 'Emergency Visit',
    description: 'Urgent dental care for immediate relief',
    duration: 45,
    price: 300,
    category: 'emergency',
    icon: Zap,
    color: 'red'
  }
];

const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const hours = [9, 10, 11, 14, 15, 16, 17];

  hours.forEach(hour => {
    [0, 30].forEach(minute => {
      const isAvailable = Math.random() > 0.3; // 70% availability
      const isEmergency = hour === 17 && minute === 30;

      slots.push({
        id: `${hour}:${minute.toString().padStart(2, '0')}`,
        time: `${hour}:${minute.toString().padStart(2, '0')}`,
        available: isAvailable,
        provider: mockProviders[Math.floor(Math.random() * mockProviders.length)].id,
        emergency: isEmergency
      });
    });
  });

  return slots;
};

export function AdvancedBooking() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AppointmentForm>({
    service: null,
    provider: null,
    date: null,
    time: null,
    patient: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      isNewPatient: true,
      insurance: '',
      emergencyContact: '',
      medicalHistory: []
    },
    notes: '',
    paymentMethod: 'insurance'
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(generateTimeSlots(selectedDate));
    }
  }, [selectedDate]);

  const filteredServices = useMemo(() => {
    let services = mockServices;

    if (searchTerm) {
      services = services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (serviceFilter !== 'all') {
      services = services.filter(service => service.category === serviceFilter);
    }

    return services;
  }, [searchTerm, serviceFilter]);

  const availableTimeSlots = useMemo(() => {
    return timeSlots.filter(slot => slot.available);
  }, [timeSlots]);

  const totalPrice = useMemo(() => {
    if (!form.service || !form.provider) return 0;

    const basePrice = form.service.price;
    const providerMultiplier = form.provider.specialty === 'Oral Surgery' ? 1.2 : 1;
    const emergencyMultiplier = form.time?.emergency ? 1.5 : 1;

    return Math.round(basePrice * providerMultiplier * emergencyMultiplier);
  }, [form.service, form.provider, form.time]);

  const handleServiceSelect = (service: Service) => {
    setForm(prev => ({ ...prev, service }));
    setStep(2);
  };

  const handleProviderSelect = (provider: Provider) => {
    setForm(prev => ({ ...prev, provider }));
    setStep(3);
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    setForm(prev => ({ ...prev, time: timeSlot, date: selectedDate }));
    setStep(4);
  };

  const handlePatientInfoUpdate = (field: keyof AppointmentForm['patient'], value: any) => {
    setForm(prev => ({
      ...prev,
      patient: { ...prev.patient, [field]: value }
    }));
  };

  const handleSubmit = () => {
    console.log('Appointment booking submitted:', form);
    setStep(5); // Confirmation step
  };

  const ServiceCard = ({ service }: { service: Service }) => (
    <Card
      className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-primary/20"
      onClick={() => handleServiceSelect(service)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-${service.color}-100 flex items-center justify-center`}>
          <service.icon className={`h-6 w-6 text-${service.color}-600`} />
        </div>
        {service.popular && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Popular
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{service.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <Timer className="h-4 w-4 mr-1" />
            {service.duration}min
          </span>
          <span className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            ${service.price}
          </span>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400" />
      </div>
    </Card>
  );

  const ProviderCard = ({ provider }: { provider: Provider }) => (
    <Card
      className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-primary/20"
      onClick={() => handleProviderSelect(provider)}
    >
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <User className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
          <p className="text-sm text-gray-600">{provider.title}</p>
          <p className="text-sm text-blue-600 font-medium">{provider.specialty}</p>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-900">{provider.rating}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Experience:</span>
          <span className="ml-1 font-medium">{provider.experience} years</span>
        </div>
        <div>
          <span className="text-gray-500">Languages:</span>
          <span className="ml-1 font-medium">{provider.languages.join(', ')}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Next available: {new Date(provider.nextAvailable).toLocaleDateString()}
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400" />
      </div>
    </Card>
  );

  const TimeSlotButton = ({ slot }: { slot: TimeSlot }) => (
    <Button
      variant={slot.emergency ? "destructive" : "outline"}
      className={cn(
        "h-12 text-sm transition-all duration-200",
        slot.emergency && "bg-red-500 hover:bg-red-600 text-white"
      )}
      onClick={() => handleTimeSelect(slot)}
    >
      <div className="flex flex-col items-center space-y-1">
        <span>{slot.time}</span>
        {slot.emergency && (
          <span className="text-xs opacity-80">Emergency</span>
        )}
      </div>
    </Button>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Choose a Service</h2>
              <p className="text-gray-600 mt-2">Select the dental service you need</p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="form-input min-w-[160px]"
              >
                <option value="all">All Categories</option>
                <option value="preventive">Preventive</option>
                <option value="restorative">Restorative</option>
                <option value="cosmetic">Cosmetic</option>
                <option value="emergency">Emergency</option>
                <option value="surgical">Surgical</option>
              </select>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Choose a Provider</h2>
              <p className="text-gray-600 mt-2">Select your preferred dentist</p>
            </div>

            <div className="space-y-4">
              {mockProviders.map(provider => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="w-full"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Select Date & Time</h2>
              <p className="text-gray-600 mt-2">Choose when you'd like your appointment</p>
            </div>

            {/* Calendar would go here - simplified for demo */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Available Times for {selectedDate.toDateString()}</h3>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableTimeSlots.map(slot => (
                  <TimeSlotButton key={slot.id} slot={slot} />
                ))}
              </div>

              {availableTimeSlots.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No available slots for this date</p>
                  <Button variant="outline" className="mt-4">
                    Choose Different Date
                  </Button>
                </div>
              )}
            </Card>

            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="w-full"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Providers
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Patient Information</h2>
              <p className="text-gray-600 mt-2">Tell us about yourself</p>
            </div>

            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={form.patient.name}
                    onChange={(e) => handlePatientInfoUpdate('name', e.target.value)}
                    className="form-input"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={form.patient.email}
                    onChange={(e) => handlePatientInfoUpdate('email', e.target.value)}
                    className="form-input"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={form.patient.phone}
                    onChange={(e) => handlePatientInfoUpdate('phone', e.target.value)}
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    value={form.patient.dateOfBirth}
                    onChange={(e) => handlePatientInfoUpdate('dateOfBirth', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Insurance Provider</label>
                  <select
                    value={form.patient.insurance}
                    onChange={(e) => handlePatientInfoUpdate('insurance', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select Insurance</option>
                    <option value="delta_dental">Delta Dental</option>
                    <option value="cigna">Cigna</option>
                    <option value="aetna">Aetna</option>
                    <option value="metlife">MetLife</option>
                    <option value="none">No Insurance</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Special Notes or Concerns</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="form-input resize-none"
                    placeholder="Any specific concerns or requirements..."
                  />
                </div>
              </div>
            </Card>

            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 btn-medical"
                disabled={!form.patient.name || !form.patient.email || !form.patient.phone}
              >
                Book Appointment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">Appointment Confirmed!</h2>
              <p className="text-gray-600 mt-2">Your appointment has been successfully scheduled</p>
            </div>

            <Card className="p-6 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Appointment Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{form.service?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium">{form.provider?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{form.date?.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{form.time?.time}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg">${totalPrice}</span>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Button className="btn-medical w-full max-w-md">
                Add to Calendar
              </Button>
              <Button variant="outline" className="w-full max-w-md">
                Print Confirmation
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">Book Appointment</h1>

            {/* Progress indicators */}
            <div className="hidden sm:flex items-center space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    step >= i
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}>
                    {step > i ? <Check className="h-4 w-4" /> : i}
                  </div>
                  {i < 4 && (
                    <div className={cn(
                      'w-8 h-1 mx-2',
                      step > i ? 'bg-blue-600' : 'bg-gray-200'
                    )} />
                  )}
                </div>
              ))}
            </div>

            {step < 5 && (
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-responsive py-8">
        {renderStep()}
      </div>

      {/* Summary Panel */}
      {form.service && step < 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="container-responsive">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="font-medium">{form.service.name}</span>
                  {form.provider && (
                    <span className="text-gray-600 ml-2">with {form.provider.name}</span>
                  )}
                  {form.date && form.time && (
                    <span className="text-gray-600 ml-2">
                      on {form.date.toLocaleDateString()} at {form.time.time}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900">
                ${totalPrice}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}