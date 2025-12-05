'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  Filter,
  Plus,
  UserCheck,
  DollarSign,
  Calendar,
  Edit,
  Mail,
  Phone,
  UserX
} from 'lucide-react';

const mockStaff = [
  {
    id: '1',
    firstName: 'Dr. Maria',
    lastName: 'Santos',
    email: 'maria.santos@clinic.com',
    phone: '+63 917 123 4567',
    position: 'Senior Dentist',
    role: 'dentist',
    specialization: 'Orthodontics',
    commissionRate: 40,
    basicPay: 50000,
    status: 'active',
    joinDate: '2023-01-15',
    avatar: null
  },
  {
    id: '2',
    firstName: 'Ana',
    lastName: 'Rodriguez',
    email: 'ana.rodriguez@clinic.com',
    phone: '+63 917 234 5678',
    position: 'Dental Hygienist',
    role: 'staff',
    specialization: 'Dental Hygiene',
    commissionRate: 15,
    basicPay: 25000,
    status: 'active',
    joinDate: '2023-03-10',
    avatar: null
  },
  {
    id: '3',
    firstName: 'Carlos',
    lastName: 'Mendez',
    email: 'carlos.mendez@clinic.com',
    phone: '+63 917 345 6789',
    position: 'Dental Assistant',
    role: 'staff',
    specialization: 'General Assistance',
    commissionRate: 10,
    basicPay: 18000,
    status: 'active',
    joinDate: '2023-05-20',
    avatar: null
  },
  {
    id: '4',
    firstName: 'Lisa',
    lastName: 'Garcia',
    email: 'lisa.garcia@clinic.com',
    phone: '+63 917 456 7890',
    position: 'Receptionist',
    role: 'admin',
    specialization: 'Administration',
    commissionRate: 5,
    basicPay: 20000,
    status: 'on_leave',
    joinDate: '2022-11-01',
    avatar: null
  }
];

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'dentist':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'on_leave':
        return 'secondary';
      case 'inactive':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredStaff = mockStaff.filter(staff => {
    const matchesSearch =
      staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || staff.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const activeStaff = mockStaff.filter(staff => staff.status === 'active').length;
  const totalPayroll = mockStaff.reduce((sum, staff) => sum + staff.basicPay, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your team members and payroll information
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{mockStaff.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-green-600">{activeStaff}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
                <p className="text-2xl font-bold text-purple-600">₱{totalPayroll.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockStaff.filter(s => s.status === 'on_leave').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
            >
              <option value="all">All Roles</option>
              <option value="dentist">Dentists</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <div className="space-y-4">
        {filteredStaff.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No staff members found</p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Staff Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredStaff.map((staff) => (
            <Card key={staff.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    {/* Staff Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {staff.firstName} {staff.lastName}
                          </h3>
                          <Badge variant={getStatusColor(staff.status)}>
                            {staff.status.replace('_', ' ')}
                          </Badge>
                          <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(staff.role)}`}>
                            {staff.role}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-gray-600 mb-2">{staff.position}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{staff.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{staff.phone}</span>
                          </div>
                          <div>
                            <span className="font-medium">Specialization:</span> {staff.specialization}
                          </div>
                          <div>
                            <span className="font-medium">Joined:</span> {new Date(staff.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compensation & Actions */}
                    <div className="flex flex-col space-y-3 lg:items-end">
                      <div className="bg-gray-50 rounded-lg p-3 min-w-[200px]">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Basic Pay:</span>
                            <span className="font-medium">₱{staff.basicPay.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Commission:</span>
                            <span className="font-medium">{staff.commissionRate}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant={staff.status === 'active' ? 'outline' : 'default'}
                          size="sm"
                        >
                          {staff.status === 'active' ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}