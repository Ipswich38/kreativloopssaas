'use client';

import { useState, useEffect } from 'react';
// import { UnifiedCalendar } from '@calcom/atoms';
import type { Patient } from '@/types';
import { ManagedUserService } from '@/lib/calcom/managed-users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, User } from 'lucide-react';

interface CalBookingWidgetProps {
  patient: Patient;
  onBookingComplete?: (booking: any) => void;
}

export function CalBookingWidget({ patient, onBookingComplete }: CalBookingWidgetProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCalcomAccess, setHasCalcomAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managedUserService] = useState(() => new ManagedUserService());

  useEffect(() => {
    checkOrCreateCalcomUser();
  }, [patient]);

  const checkOrCreateCalcomUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (patient.calcom_user_id && patient.calcom_access_token) {
        setHasCalcomAccess(true);
        setIsLoading(false);
        return;
      }

      if (!patient.email) {
        setError('Patient email is required for scheduling');
        setIsLoading(false);
        return;
      }

      const managedUser = await managedUserService.createManagedUserForPatient(
        patient,
        'America/New_York'
      );

      patient.calcom_user_id = managedUser.id;
      patient.calcom_access_token = managedUser.accessToken;
      patient.calcom_refresh_token = managedUser.refreshToken;
      patient.calcom_token_expires_at = managedUser.expiresAt.toISOString();

      setHasCalcomAccess(true);
    } catch (err) {
      console.error('Failed to setup Cal.com user:', err);
      setError('Failed to setup scheduling for this patient');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSuccess = (booking: any) => {
    console.log('Booking created:', booking);
    onBookingComplete?.(booking);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Schedule Appointment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Setting up scheduling...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Schedule Appointment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={checkOrCreateCalcomUser}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasCalcomAccess || !patient.calcom_access_token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Schedule Appointment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Scheduling is not available for this patient
            </p>
            <Button onClick={checkOrCreateCalcomUser}>
              Setup Scheduling
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Schedule Appointment
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {patient.first_name} {patient.last_name}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Available times
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="cal-booking-container">
          <div className="border rounded-lg p-8 text-center bg-gray-50">
            <CalendarDays className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cal.com Booking Widget
            </h3>
            <p className="text-gray-600 mb-4">
              Scheduling interface will be available once Cal.com integration is fully configured.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Patient: {patient.first_name} {patient.last_name}</p>
              <p>Email: {patient.email}</p>
              <p>Access Token: {patient.calcom_access_token ? 'Available' : 'Not Set'}</p>
            </div>
            <Button onClick={handleBookingSuccess} className="mt-4">
              Simulate Booking (Demo)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}