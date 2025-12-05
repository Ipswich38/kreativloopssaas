"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  FileText
} from 'lucide-react'

// Mock patients data
const mockPatients = [
  {
    id: '1',
    patientNumber: 'P001',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '09123456789',
    dateOfBirth: '1985-03-15',
    gender: 'Female',
    lastVisit: '2024-11-28',
    nextAppointment: '2024-12-10',
    status: 'active'
  },
  {
    id: '2',
    patientNumber: 'P002',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@email.com',
    phone: '09198765432',
    dateOfBirth: '1978-07-22',
    gender: 'Male',
    lastVisit: '2024-12-01',
    nextAppointment: null,
    status: 'active'
  },
  {
    id: '3',
    patientNumber: 'P003',
    name: 'Ana Garcia',
    email: 'ana.garcia@email.com',
    phone: '09171234567',
    dateOfBirth: '1992-12-08',
    gender: 'Female',
    lastVisit: '2024-10-15',
    nextAppointment: '2024-12-05',
    status: 'active'
  },
  {
    id: '4',
    patientNumber: 'P004',
    name: 'Carlos Reyes',
    email: 'carlos.reyes@email.com',
    phone: '09184567890',
    dateOfBirth: '1989-05-30',
    gender: 'Male',
    lastVisit: '2024-11-20',
    nextAppointment: '2024-12-06',
    status: 'active'
  }
]

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

  const getAge = (dateOfBirth: string) => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage patient records and information
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Patient
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
                placeholder="Search by name, patient number, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex space-x-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All ({mockPatients.length})
              </Button>
              <Button
                variant={selectedFilter === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('recent')}
              >
                Recent Visits
              </Button>
              <Button
                variant={selectedFilter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('upcoming')}
              >
                Upcoming
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{patient.name}</CardTitle>
                  <p className="text-sm text-gray-500">#{patient.patientNumber}</p>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{patient.email}</span>
                </div>
              </div>

              {/* Patient Details */}
              <div className="bg-gray-50 rounded-md p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Age</span>
                  <span className="text-sm font-medium">{getAge(patient.dateOfBirth)} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Gender</span>
                  <span className="text-sm font-medium">{patient.gender}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Last Visit</span>
                  <span className="text-sm font-medium">
                    {new Date(patient.lastVisit).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Next Appointment */}
              {patient.nextAppointment && (
                <div className="bg-primary-50 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary-600" />
                    <div>
                      <p className="text-xs text-primary-600 font-medium">Next Appointment</p>
                      <p className="text-sm text-primary-700">
                        {new Date(patient.nextAppointment).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="mr-2 h-3 w-3" />
                  Records
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Calendar className="mr-2 h-3 w-3" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No patients found</p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add First Patient
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}