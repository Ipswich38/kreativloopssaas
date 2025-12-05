'use client';

import { useState, useEffect } from 'react';
import { calcomApi } from '@/lib/calcom/api-client';
import type { Patient } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

interface EventType {
  id: number;
  title: string;
  slug: string;
  length: number;
  description?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface LiveCalBookingProps {
  patient: Patient;
  onBookingComplete?: (booking: any) => void;
}

export function LiveCalBooking({ patient, onBookingComplete }: LiveCalBookingProps) {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadEventTypes();
  }, []);

  useEffect(() => {
    if (selectedEventType && selectedDate) {
      loadAvailability();
    }
  }, [selectedEventType, selectedDate]);

  const loadEventTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const types = await calcomApi.getEventTypes();
      setEventTypes(types || []);
      if (types && types.length > 0) {
        setSelectedEventType(types[0]);
      }
    } catch (err) {
      setError(`Failed to load event types: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    if (!selectedEventType) return;

    try {
      setError(null);
      const dateTo = new Date(selectedDate);
      dateTo.setDate(dateTo.getDate() + 1);

      const availability = await calcomApi.getAvailability({
        eventTypeId: selectedEventType.id,
        dateFrom: selectedDate,
        dateTo: dateTo.toISOString().split('T')[0],
        timeZone: 'America/New_York',
      });

      // Transform availability data into time slots
      const slots: TimeSlot[] = [];
      if (availability && availability.slots) {
        availability.slots.forEach((slot: any) => {
          slots.push({
            time: new Date(slot.time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            available: true,
          });
        });
      }

      // Generate some demo slots if no real data
      if (slots.length === 0) {
        const demoTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
        demoTimes.forEach(time => {
          slots.push({ time, available: true });
        });
      }

      setAvailableSlots(slots);
      setSelectedTime(null);
    } catch (err) {
      setError(`Failed to load availability: ${err}`);
      setAvailableSlots([]);
    }
  };

  const createBooking = async () => {
    if (!selectedEventType || !selectedTime || !patient.email) {
      setError('Please select all required fields and ensure patient has email');
      return;
    }

    try {
      setBooking(true);
      setError(null);

      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);

      const bookingData = {
        eventTypeId: selectedEventType.id,
        start: startDateTime.toISOString(),
        attendee: {
          name: `${patient.first_name} ${patient.last_name}`,
          email: patient.email,
          timeZone: 'America/New_York',
        },
        metadata: {
          patientId: patient.id,
          clinicId: patient.clinic_id,
        },
      };

      const result = await calcomApi.createBooking(bookingData);

      setSuccess(`Booking created successfully! Reference: ${result.uid || result.id}`);
      onBookingComplete?.(result);
    } catch (err) {
      setError(`Failed to create booking: ${err}`);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Live Cal.com Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2">Loading event types...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && eventTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Live Cal.com Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadEventTypes} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Booking Confirmed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Appointment Successfully Scheduled!
            </h3>
            <p className="text-green-600 mb-6">{success}</p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{patient.first_name} {patient.last_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>{selectedEventType?.title} ({selectedEventType?.length} min)</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setSuccess(null);
                setSelectedTime(null);
                setSelectedDate(new Date().toISOString().split('T')[0]);
              }}
              variant="outline"
            >
              Book Another Appointment
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
          Live Cal.com Booking
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {patient.first_name} {patient.last_name}
          </div>
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            {patient.email || 'No email'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Event Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Service
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {eventTypes.map((eventType) => (
              <button
                key={eventType.id}
                onClick={() => setSelectedEventType(eventType)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedEventType?.id === eventType.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{eventType.title}</div>
                <div className="text-sm text-gray-600">{eventType.length} minutes</div>
                {eventType.description && (
                  <div className="text-xs text-gray-500 mt-1">{eventType.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full"
          />
        </div>

        {/* Time Slot Selection */}
        {availableSlots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Times
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`p-2 text-sm border rounded transition-colors ${
                    selectedTime === slot.time
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : slot.available
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Booking Summary */}
        {selectedEventType && selectedTime && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Service: {selectedEventType.title}</div>
              <div>Duration: {selectedEventType.length} minutes</div>
              <div>Date: {new Date(selectedDate).toLocaleDateString()}</div>
              <div>Time: {selectedTime}</div>
              <div>Patient: {patient.first_name} {patient.last_name}</div>
            </div>
          </div>
        )}

        {/* Book Button */}
        <Button
          onClick={createBooking}
          disabled={!selectedEventType || !selectedTime || booking || !patient.email}
          className="w-full"
        >
          {booking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating Booking...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </>
          )}
        </Button>

        {!patient.email && (
          <p className="text-sm text-amber-600 text-center">
            ⚠️ Patient email is required to create bookings
          </p>
        )}
      </CardContent>
    </Card>
  );
}