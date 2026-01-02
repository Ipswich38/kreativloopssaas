'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Download,
  Heart,
  Pill,
  AlertCircle,
  CheckCircle,
  Star,
  MessageCircle,
  Camera,
  QrCode,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Plus,
  X,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Mock data types
interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  provider: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  duration: number;
  notes?: string;
  canCancel?: boolean;
  canReschedule?: boolean;
}

interface TreatmentPlan {
  id: string;
  procedure: string;
  tooth?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCost: number;
  status: 'pending' | 'approved' | 'in_progress' | 'completed';
  description: string;
  scheduledDate?: string;
}

interface Document {
  id: string;
  name: string;
  type: 'x-ray' | 'report' | 'insurance' | 'prescription' | 'treatment_plan';
  date: string;
  size: string;
  url: string;
  thumbnail?: string;
}

interface Bill {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate?: string;
}

interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  priority: 'normal' | 'high';
}

const mockData = {
  patient: {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-03-15',
    address: '123 Main St, City, State 12345',
    emergencyContact: 'John Johnson - (555) 987-6543',
    insurance: 'Delta Dental - Plan #12345'
  },
  appointments: [
    {
      id: 'apt_1',
      date: '2025-01-15',
      time: '10:00 AM',
      type: 'Cleaning & Checkup',
      provider: 'Dr. Smith',
      status: 'upcoming' as const,
      duration: 60,
      canCancel: true,
      canReschedule: true
    },
    {
      id: 'apt_2',
      date: '2025-02-20',
      time: '2:30 PM',
      type: 'Crown Placement',
      provider: 'Dr. Johnson',
      status: 'upcoming' as const,
      duration: 90,
      canCancel: false,
      canReschedule: true
    }
  ] as Appointment[],
  treatmentPlan: [
    {
      id: 'tx_1',
      procedure: 'Porcelain Crown',
      tooth: '#14',
      priority: 'high' as const,
      estimatedCost: 1200,
      status: 'approved' as const,
      description: 'Crown replacement for fractured tooth #14',
      scheduledDate: '2025-02-20'
    },
    {
      id: 'tx_2',
      procedure: 'Deep Cleaning',
      priority: 'medium' as const,
      estimatedCost: 350,
      status: 'pending' as const,
      description: 'Deep cleaning for periodontal maintenance'
    }
  ] as TreatmentPlan[],
  bills: [
    {
      id: 'bill_1',
      date: '2024-12-15',
      description: 'Routine Cleaning & X-rays',
      amount: 285,
      status: 'paid' as const
    },
    {
      id: 'bill_2',
      date: '2024-12-01',
      description: 'Consultation & Treatment Plan',
      amount: 150,
      status: 'pending' as const,
      dueDate: '2025-01-01'
    }
  ] as Bill[],
  documents: [
    {
      id: 'doc_1',
      name: 'Panoramic X-Ray',
      type: 'x-ray' as const,
      date: '2024-12-15',
      size: '2.4 MB',
      url: '/documents/xray_001.jpg'
    },
    {
      id: 'doc_2',
      name: 'Treatment Summary',
      type: 'report' as const,
      date: '2024-12-15',
      size: '856 KB',
      url: '/documents/report_001.pdf'
    }
  ] as Document[],
  messages: [
    {
      id: 'msg_1',
      from: 'Dr. Smith\'s Office',
      subject: 'Appointment Reminder',
      preview: 'Your cleaning appointment is scheduled for tomorrow at 10:00 AM.',
      date: '2025-01-14',
      read: false,
      priority: 'high' as const
    },
    {
      id: 'msg_2',
      from: 'Billing Department',
      subject: 'Payment Confirmation',
      preview: 'Thank you for your payment of $285. Your account is current.',
      date: '2025-01-10',
      read: true,
      priority: 'normal' as const
    }
  ] as Message[]
};

export function PatientPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [newMessageText, setNewMessageText] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'treatment', label: 'Treatment', icon: Pill },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'messages', label: 'Messages', icon: MessageCircle }
  ];

  const QuickActionCard = ({ icon: Icon, title, description, action, color = 'blue' }: {
    icon: any;
    title: string;
    description: string;
    action: () => void;
    color?: string;
  }) => (
    <Card
      className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-0 glass-card"
      onClick={action}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
          <p className="text-sm text-gray-600 truncate">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Card>
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="p-4 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{appointment.type}</h3>
          <p className="text-sm text-gray-600">{appointment.provider}</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(appointment.date).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {appointment.time}
            </div>
          </div>
        </div>
        <Badge
          variant={appointment.status === 'upcoming' ? 'default' : 'secondary'}
          className="ml-2"
        >
          {appointment.status}
        </Badge>
      </div>

      {appointment.status === 'upcoming' && (
        <div className="flex space-x-2 mt-4">
          {appointment.canReschedule && (
            <Button variant="outline" size="sm">
              Reschedule
            </Button>
          )}
          {appointment.canCancel && (
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          )}
        </div>
      )}
    </Card>
  );

  const TreatmentCard = ({ treatment }: { treatment: TreatmentPlan }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{treatment.procedure}</h3>
          {treatment.tooth && (
            <p className="text-sm text-gray-600">Tooth {treatment.tooth}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={treatment.priority === 'high' ? 'destructive' :
                    treatment.priority === 'medium' ? 'default' : 'secondary'}
          >
            {treatment.priority} priority
          </Badge>
          <Badge variant="outline">
            ${treatment.estimatedCost}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{treatment.description}</p>

      <div className="flex items-center justify-between">
        <Badge
          variant={treatment.status === 'approved' ? 'default' : 'secondary'}
        >
          {treatment.status.replace('_', ' ')}
        </Badge>
        {treatment.status === 'pending' && (
          <Button size="sm" className="btn-medical">
            Approve Treatment
          </Button>
        )}
      </div>
    </Card>
  );

  const DocumentCard = ({ document }: { document: Document }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{document.name}</h3>
            <p className="text-sm text-gray-600">
              {new Date(document.date).toLocaleDateString()} • {document.size}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </Card>
  );

  const MessageCard = ({ message }: { message: Message }) => (
    <Card className={cn('p-4 cursor-pointer hover:shadow-md transition-shadow', {
      'bg-blue-50 border-blue-200': !message.read
    })}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className={cn('font-medium', message.read ? 'text-gray-700' : 'text-gray-900')}>
              {message.from}
            </h3>
            {!message.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
            {message.priority === 'high' && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className={cn('font-medium text-sm', message.read ? 'text-gray-600' : 'text-gray-900')}>
            {message.subject}
          </p>
          <p className="text-sm text-gray-500 mt-1">{message.preview}</p>
        </div>
        <div className="text-xs text-gray-400 ml-4">
          {new Date(message.date).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickActionCard
                  icon={Calendar}
                  title="Schedule Appointment"
                  description="Book your next visit"
                  action={() => setActiveTab('appointments')}
                  color="blue"
                />
                <QuickActionCard
                  icon={MessageCircle}
                  title="Contact Office"
                  description="Send a message to your dental team"
                  action={() => setActiveTab('messages')}
                  color="green"
                />
                <QuickActionCard
                  icon={CreditCard}
                  title="Make Payment"
                  description="Pay bills and view statements"
                  action={() => setActiveTab('billing')}
                  color="purple"
                />
                <QuickActionCard
                  icon={FileText}
                  title="View Records"
                  description="Access your dental records"
                  action={() => setActiveTab('documents')}
                  color="orange"
                />
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {mockData.appointments.slice(0, 2).map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </div>

            {/* Recent Messages */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Messages</h2>
                <Badge variant="secondary">{notifications} new</Badge>
              </div>
              <div className="space-y-3">
                {mockData.messages.slice(0, 2).map(message => (
                  <MessageCard key={message.id} message={message} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">My Appointments</h2>
              <Button className="btn-medical">
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
            <div className="space-y-4">
              {mockData.appointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </div>
        );

      case 'treatment':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Treatment Plan</h2>
            <div className="space-y-4">
              {mockData.treatmentPlan.map(treatment => (
                <TreatmentCard key={treatment.id} treatment={treatment} />
              ))}
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">My Documents</h2>
            <div className="space-y-4">
              {mockData.documents.map(document => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Billing & Payments</h2>
            <div className="space-y-4">
              {mockData.bills.map(bill => (
                <Card key={bill.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{bill.description}</h3>
                      <p className="text-sm text-gray-600">{new Date(bill.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${bill.amount}</p>
                        <Badge
                          variant={bill.status === 'paid' ? 'default' :
                                  bill.status === 'overdue' ? 'destructive' : 'secondary'}
                        >
                          {bill.status}
                        </Badge>
                      </div>
                      {bill.status === 'pending' && (
                        <Button size="sm" className="btn-medical">
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              <Button
                onClick={() => setShowNewMessage(true)}
                className="btn-medical"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
            <div className="space-y-3">
              {mockData.messages.map(message => (
                <MessageCard key={message.id} message={message} />
              ))}
            </div>

            {showNewMessage && (
              <Card className="p-4 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">New Message</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewMessage(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Subject"
                    className="form-input"
                  />
                  <textarea
                    rows={4}
                    placeholder="Type your message here..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="form-input resize-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowNewMessage(false)}>
                      Cancel
                    </Button>
                    <Button className="btn-medical">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Patient Portal</h1>
                <p className="text-sm text-gray-600">Welcome back, {mockData.patient.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfile(!showProfile)}
                className="relative"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto lg:hidden">
        <div className="flex space-x-1 px-4 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="container-responsive py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}