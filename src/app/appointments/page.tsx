"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AppointmentScheduler } from '@/components/scheduling/appointment-scheduler'
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  User,
  Phone
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Patient, Appointment } from '@/types'

// Mock data for testing
const mockPatients: Patient[] = [
  {
    id: '1',
    clinic_id: 'clinic_1',
    first_name: 'Maria',
    last_name: 'Santos',
    email: 'maria.santos@email.com',
    phone: '09123456789',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    clinic_id: 'clinic_1',
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    email: 'juan.delacruz@email.com',
    phone: '09198765432',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    clinic_id: 'clinic_1',
    patient_id: '1',
    dentist_id: 'dentist_1',
    service_ids: ['service_1'],
    date: '2024-12-05',
    time: '09:00',
    duration: 60,
    status: 'confirmed',
    total_amount: 2500,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('2024-12-05')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)

  const handleNewAppointment = () => {
    if (mockPatients.length > 0) {
      setSelectedPatient(mockPatients[0])
      setShowScheduler(true)
    }
  }

  const handleAppointmentScheduled = (appointment: any) => {
    console.log('Appointment scheduled:', appointment)
    setShowScheduler(false)
    setSelectedPatient(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-primary-100 text-primary-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAppointments = mockAppointments.filter(appointment =>
    appointment.date === selectedDate
  )

  if (showScheduler && selectedPatient) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setShowScheduler(false)
              setSelectedPatient(null)
            }}
          >
            ← Back to Appointments
          </Button>
        </div>
        <AppointmentScheduler
          patient={selectedPatient}
          existingAppointments={filteredAppointments}
          onAppointmentScheduled={handleAppointmentScheduled}
        />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your daily schedule and patient appointments
          </p>
        </div>

        <Button onClick={handleNewAppointment}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date picker */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 w-40"
              />
            </div>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No appointments found for the selected date</p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => {
            const patient = mockPatients.find(p => p.id === appointment.patient_id);
            return (
              <Card key={appointment.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Time indicator */}
                    <div className="lg:w-20 bg-primary-50 p-4 flex flex-row lg:flex-col items-center lg:justify-center space-x-2 lg:space-x-0 lg:space-y-1">
                      <Clock className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-700">
                        {appointment.time}
                      </span>
                    </div>

                    {/* Appointment details */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}
                            </span>
                            <Badge variant={
                              appointment.status === 'confirmed' ? 'default' :
                              appointment.status === 'cancelled' ? 'destructive' :
                              'secondary'
                            }>
                              {appointment.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{patient?.phone || 'No phone'}</span>
                              </span>
                            </div>
                            <div>
                              <strong>Appointment</strong> - {appointment.duration} minutes
                            </div>
                            <div className="flex items-center space-x-4">
                              <span>{appointment.duration} minutes</span>
                              <span className="font-medium text-primary-600">
                                {formatCurrency(appointment.total_amount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  )
}