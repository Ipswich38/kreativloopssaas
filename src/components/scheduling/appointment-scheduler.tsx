'use client';

import { useState } from 'react';
import { CalBookingWidget } from './cal-booking-widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Patient, Appointment } from '@/types';
import { Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react';

interface AppointmentSchedulerProps {
  patient: Patient;
  existingAppointments?: Appointment[];
  onAppointmentScheduled?: (appointment: any) => void;
}

export function AppointmentScheduler({
  patient,
  existingAppointments = [],
  onAppointmentScheduled
}: AppointmentSchedulerProps) {
  const [selectedTab, setSelectedTab] = useState<'schedule' | 'upcoming'>('schedule');

  const handleBookingComplete = (booking: any) => {
    console.log('New appointment booked:', booking);
    onAppointmentScheduled?.(booking);
    setSelectedTab('upcoming');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Appointment Scheduling
        </h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={selectedTab === 'schedule' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('schedule')}
            className="rounded-md"
          >
            Schedule New
          </Button>
          <Button
            variant={selectedTab === 'upcoming' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTab('upcoming')}
            className="rounded-md"
          >
            Upcoming ({existingAppointments.length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {selectedTab === 'schedule' ? (
            <CalBookingWidget
              patient={patient}
              onBookingComplete={handleBookingComplete}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {existingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {existingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                              </span>
                              <Badge variant={
                                appointment.status === 'confirmed' ? 'default' :
                                appointment.status === 'cancelled' ? 'destructive' :
                                'secondary'
                              }>
                                {appointment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Duration: {appointment.duration} minutes
                            </p>
                            {appointment.notes && (
                              <p className="text-sm text-gray-600">
                                Notes: {appointment.notes}
                              </p>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming appointments</p>
                    <Button
                      onClick={() => setSelectedTab('schedule')}
                      className="mt-4"
                    >
                      Schedule First Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">
                  {patient.first_name} {patient.last_name}
                </h4>
                {patient.date_of_birth && (
                  <p className="text-sm text-gray-600">
                    DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                  </p>
                )}
              </div>

              {patient.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{patient.email}</span>
                </div>
              )}

              {patient.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{patient.phone}</span>
                </div>
              )}

              {patient.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-sm">{patient.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scheduling Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Appointments can be scheduled up to 3 months in advance</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Cancellations require 24-hour advance notice</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Confirmation will be sent via email and SMS</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>Please arrive 15 minutes early for your appointment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}