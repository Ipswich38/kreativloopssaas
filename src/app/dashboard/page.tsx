"use client"

import { useState, useEffect } from 'react'
import { StatCard } from '@/components/dashboard/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock data based on CSV analysis
const mockStats = {
  todayAppointments: 8,
  totalPatients: 156,
  monthlyRevenue: 1197005,
  appointmentsTrend: { value: 12, label: 'vs last month', isPositive: true },
  patientsTrend: { value: 5, label: 'vs last month', isPositive: true },
  revenueTrend: { value: 8, label: 'vs last month', isPositive: true }
}

const recentAppointments = [
  { id: 1, patient: 'Maria Santos', time: '9:00 AM', service: 'Oral Prophylaxis', status: 'confirmed' },
  { id: 2, patient: 'Juan Dela Cruz', time: '10:30 AM', service: 'Tooth Restoration', status: 'in_progress' },
  { id: 3, patient: 'Ana Garcia', time: '2:00 PM', service: 'Dental Crown', status: 'scheduled' },
  { id: 4, patient: 'Carlos Reyes', time: '3:30 PM', service: 'Teeth Cleaning', status: 'scheduled' }
]

const quickActions = [
  { label: 'New Appointment', icon: Calendar, href: '/appointments/new' },
  { label: 'Add Patient', icon: Users, href: '/patients/new' },
  { label: 'Record Payment', icon: DollarSign, href: '/financial/payments/new' },
  { label: 'View Reports', icon: TrendingUp, href: '/reports' }
]

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            {currentTime.toLocaleDateString('en-PH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {currentTime.toLocaleTimeString('en-PH')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Today's Appointments"
          value={mockStats.todayAppointments}
          icon={Calendar}
          trend={mockStats.appointmentsTrend}
        />
        <StatCard
          title="Total Patients"
          value={mockStats.totalPatients}
          icon={Users}
          trend={mockStats.patientsTrend}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(mockStats.monthlyRevenue)}
          icon={DollarSign}
          trend={mockStats.revenueTrend}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <action.icon className="h-6 w-6 text-primary-600" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Today's Schedule</CardTitle>
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {appointment.patient}
                  </p>
                  <p className="text-xs text-gray-500">
                    {appointment.service} • {appointment.time}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(appointment.status)}`}
                >
                  {appointment.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gradient-to-t from-primary-50 to-primary-100 rounded-md flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Revenue chart placeholder</p>
                <p className="text-xs text-gray-500 mt-1">Chart will be implemented with real data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}