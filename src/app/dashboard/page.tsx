'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Heart,
  Pill,
  Calendar,
  MapPin,
  Phone,
  Star,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Activity,
  UserCheck,
  CreditCard,
  FileText,
  Stethoscope,
  Target,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DentalChart } from '@/components/dental/dental-chart';

// Mock data interfaces
interface DashboardMetrics {
  todayAppointments: number;
  todayRevenue: number;
  activePatients: number;
  completionRate: number;
  trends: {
    appointments: number;
    revenue: number;
    patients: number;
    completion: number;
  };
}

interface Appointment {
  id: string;
  patient: string;
  time: string;
  type: string;
  provider: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show';
  duration: number;
  revenue?: number;
  priority?: 'low' | 'medium' | 'high';
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  actionRequired?: boolean;
}

interface QuickStat {
  label: string;
  value: string;
  change: number;
  icon: any;
  color: string;
  period: string;
}

// Mock data
const mockMetrics: DashboardMetrics = {
  todayAppointments: 24,
  todayRevenue: 4250,
  activePatients: 1847,
  completionRate: 94.2,
  trends: {
    appointments: 8.2,
    revenue: 12.5,
    patients: 3.7,
    completion: -1.2,
  },
};

const mockAppointments: Appointment[] = [
  {
    id: 'apt_1',
    patient: 'Sarah Johnson',
    time: '09:00',
    type: 'Cleaning & Checkup',
    provider: 'Dr. Smith',
    status: 'confirmed',
    duration: 60,
    revenue: 180,
    priority: 'medium'
  },
  {
    id: 'apt_2',
    patient: 'Michael Chen',
    time: '10:30',
    type: 'Root Canal Consultation',
    provider: 'Dr. Johnson',
    status: 'confirmed',
    duration: 45,
    revenue: 650,
    priority: 'high'
  },
  {
    id: 'apt_3',
    patient: 'Emily Davis',
    time: '11:15',
    type: 'Crown Placement',
    provider: 'Dr. Smith',
    status: 'pending',
    duration: 90,
    revenue: 1200
  },
  {
    id: 'apt_4',
    patient: 'Robert Wilson',
    time: '14:00',
    type: 'Emergency Visit',
    provider: 'Dr. Johnson',
    status: 'confirmed',
    duration: 30,
    revenue: 300,
    priority: 'high'
  },
  {
    id: 'apt_5',
    patient: 'Lisa Brown',
    time: '15:30',
    type: 'Teeth Whitening',
    provider: 'Dr. Martinez',
    status: 'completed',
    duration: 60,
    revenue: 450
  }
];

const mockAlerts: Alert[] = [
  {
    id: 'alert_1',
    type: 'critical',
    title: 'Equipment Maintenance Due',
    message: 'X-ray machine requires scheduled maintenance',
    time: '2 hours ago',
    actionRequired: true
  },
  {
    id: 'alert_2',
    type: 'warning',
    title: 'Low Inventory',
    message: 'Dental anesthetic running low (3 units remaining)',
    time: '4 hours ago',
    actionRequired: true
  },
  {
    id: 'alert_3',
    type: 'info',
    title: 'New Patient Registration',
    message: 'John Martinez completed online registration',
    time: '1 hour ago',
    actionRequired: false
  }
];

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState('today');
  const [showDentalChart, setShowDentalChart] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const quickStats: QuickStat[] = useMemo(() => [
    {
      label: 'Today\'s Appointments',
      value: mockMetrics.todayAppointments.toString(),
      change: mockMetrics.trends.appointments,
      icon: CalendarDays,
      color: 'blue',
      period: 'vs yesterday'
    },
    {
      label: 'Today\'s Revenue',
      value: `$${mockMetrics.todayRevenue.toLocaleString()}`,
      change: mockMetrics.trends.revenue,
      icon: DollarSign,
      color: 'green',
      period: 'vs yesterday'
    },
    {
      label: 'Active Patients',
      value: mockMetrics.activePatients.toLocaleString(),
      change: mockMetrics.trends.patients,
      icon: Users,
      color: 'purple',
      period: 'this month'
    },
    {
      label: 'Completion Rate',
      value: `${mockMetrics.completionRate}%`,
      change: mockMetrics.trends.completion,
      icon: Target,
      color: 'orange',
      period: 'this week'
    }
  ], []);

  const getStatusColor = (status: Appointment['status']) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      'no-show': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.pending;
  };

  const getAlertColor = (type: Alert['type']) => {
    const colors = {
      critical: 'border-l-red-500 bg-red-50',
      warning: 'border-l-yellow-500 bg-yellow-50',
      info: 'border-l-blue-500 bg-blue-50'
    };
    return colors[type];
  };

  const StatCard = ({ stat }: { stat: QuickStat }) => (
    <Card className="p-6 glass-card hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-8 h-8 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
              <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
            </div>
            <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <div className="flex items-center space-x-1">
              {stat.change > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDownLeft className="h-3 w-3 text-red-600" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  stat.change > 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {Math.abs(stat.change)}%
              </span>
              <span className="text-xs text-gray-500">{stat.period}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">{appointment.patient}</h3>
            {appointment.priority === 'high' && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">{appointment.type}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {appointment.time}
              </span>
              <span className="flex items-center">
                <Stethoscope className="h-3 w-3 mr-1" />
                {appointment.provider}
              </span>
              {appointment.revenue && (
                <span className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  ${appointment.revenue}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Badge variant="outline" className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
          <span className="text-xs text-gray-500">{appointment.duration}min</span>
        </div>
      </div>
    </Card>
  );

  const AlertCard = ({ alert }: { alert: Alert }) => (
    <Card className={cn('p-4 border-l-4', getAlertColor(alert.type))}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
            {alert.actionRequired && (
              <Badge variant="destructive" className="text-xs">Action Required</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">{alert.message}</p>
          <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
        </div>
        <Button variant="ghost" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50" id="main-content">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <Button className="btn-medical">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Appointment</span>
              </Button>

              <Button variant="outline" className="touch-target">
                <Search className="h-4 w-4" />
              </Button>

              <Button variant="outline" className="touch-target relative">
                <Bell className="h-4 w-4" />
                {mockAlerts.filter(a => a.actionRequired).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {mockAlerts.filter(a => a.actionRequired).length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-6 space-y-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="group">
              <StatCard stat={stat} />
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Appointments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
                  <p className="text-sm text-gray-600">
                    {mockAppointments.length} appointments • {mockAppointments.filter(a => a.status === 'completed').length} completed
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {mockAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>

              <div className="flex justify-center mt-6">
                <Button variant="outline">
                  View All Appointments
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>

            {/* Quick Access Dental Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Patient Dental Chart</h2>
                <Button
                  onClick={() => setShowDentalChart(true)}
                  variant="outline"
                  size="sm"
                >
                  Open Full Chart
                </Button>
              </div>

              {showDentalChart ? (
                <div className="space-y-4">
                  <DentalChart
                    patientId="sample_patient"
                    patientName="Sarah Johnson"
                    editable={true}
                  />
                  <Button
                    onClick={() => setShowDentalChart(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Close Chart
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Interactive dental chart for comprehensive patient care</p>
                  <Button onClick={() => setShowDentalChart(true)} className="btn-medical">
                    View Dental Chart
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Alerts & Quick Actions */}
          <div className="space-y-6">
            {/* Alerts */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Alerts & Notifications</h2>
                <Badge variant="secondary">
                  {mockAlerts.filter(a => a.actionRequired).length} Action Required
                </Badge>
              </div>

              <div className="space-y-3">
                {mockAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                View All Alerts
              </Button>
            </Card>

            {/* Practice Overview */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Practice Overview</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Patients</p>
                      <p className="text-sm text-gray-600">Active cases</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">{mockMetrics.activePatients.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Revenue</p>
                      <p className="text-sm text-gray-600">This month</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">$67,450</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Completion</p>
                      <p className="text-sm text-gray-600">Success rate</p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">{mockMetrics.completionRate}%</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Star className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Rating</p>
                      <p className="text-sm text-gray-600">Patient satisfaction</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-gray-900">4.9</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-16 flex-col space-y-1">
                  <UserCheck className="h-5 w-5" />
                  <span className="text-xs">Add Patient</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col space-y-1">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">Schedule</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col space-y-1">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Billing</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col space-y-1">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Reports</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}