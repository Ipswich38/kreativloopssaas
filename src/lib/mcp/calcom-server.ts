import { z } from 'zod';
import { CalcomClient } from '../calcom/client';
import { ManagedUserService } from '../calcom/managed-users';
import type { Patient } from '@/types';

export class CalcomMCPServer {
  private calcomClient: CalcomClient;
  private managedUserService: ManagedUserService;

  constructor() {
    this.calcomClient = new CalcomClient();
    this.managedUserService = new ManagedUserService();
  }

  async listTools() {
    return [
      {
        name: 'calcom_create_managed_user',
        description: 'Create a Cal.com managed user for a dental patient',
        inputSchema: z.object({
          patientId: z.string().describe('The patient ID'),
          email: z.string().email().describe('Patient email address'),
          name: z.string().describe('Patient full name'),
          timezone: z.string().optional().describe('Patient timezone (defaults to UTC)'),
        }),
      },
      {
        name: 'calcom_get_user_bookings',
        description: 'Get all bookings for a patient',
        inputSchema: z.object({
          patientId: z.string().describe('The patient ID'),
        }),
      },
      {
        name: 'calcom_get_user_event_types',
        description: 'Get available event types for a patient',
        inputSchema: z.object({
          patientId: z.string().describe('The patient ID'),
        }),
      },
      {
        name: 'calcom_refresh_tokens',
        description: 'Refresh expired Cal.com tokens for a patient',
        inputSchema: z.object({
          patientId: z.string().describe('The patient ID'),
        }),
      },
      {
        name: 'calcom_sync_appointments',
        description: 'Sync Cal.com bookings with dental practice management system',
        inputSchema: z.object({
          clinicId: z.string().describe('The clinic ID'),
          patientIds: z.array(z.string()).optional().describe('Specific patient IDs to sync (optional)'),
        }),
      },
    ];
  }

  async callTool(name: string, args: any) {
    switch (name) {
      case 'calcom_create_managed_user':
        return await this.createManagedUser(args);
      case 'calcom_get_user_bookings':
        return await this.getUserBookings(args);
      case 'calcom_get_user_event_types':
        return await this.getUserEventTypes(args);
      case 'calcom_refresh_tokens':
        return await this.refreshTokens(args);
      case 'calcom_sync_appointments':
        return await this.syncAppointments(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  private async createManagedUser(args: {
    patientId: string;
    email: string;
    name: string;
    timezone?: string;
  }) {
    try {
      const patient: Patient = {
        id: args.patientId,
        clinic_id: 'default',
        first_name: args.name.split(' ')[0],
        last_name: args.name.split(' ').slice(1).join(' '),
        email: args.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const managedUser = await this.managedUserService.createManagedUserForPatient(
        patient,
        args.timezone || 'UTC'
      );

      return {
        success: true,
        data: {
          calcomUserId: managedUser.id,
          accessToken: managedUser.accessToken,
          refreshToken: managedUser.refreshToken,
          expiresAt: managedUser.expiresAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create managed user: ${error}`,
      };
    }
  }

  private async getUserBookings(args: { patientId: string }) {
    try {
      const patient = await this.getPatientFromDatabase(args.patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      const bookings = await this.managedUserService.getUserBookings(patient);

      return {
        success: true,
        data: { bookings },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get user bookings: ${error}`,
      };
    }
  }

  private async getUserEventTypes(args: { patientId: string }) {
    try {
      const patient = await this.getPatientFromDatabase(args.patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      const eventTypes = await this.managedUserService.getUserEventTypes(patient);

      return {
        success: true,
        data: { eventTypes },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get user event types: ${error}`,
      };
    }
  }

  private async refreshTokens(args: { patientId: string }) {
    try {
      const patient = await this.getPatientFromDatabase(args.patientId);
      if (!patient || !patient.calcom_refresh_token) {
        throw new Error('Patient not found or no refresh token available');
      }

      const refreshed = await this.managedUserService.refreshUserTokens(
        patient.calcom_refresh_token
      );

      return {
        success: true,
        data: {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          expiresAt: refreshed.expiresAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to refresh tokens: ${error}`,
      };
    }
  }

  private async syncAppointments(args: {
    clinicId: string;
    patientIds?: string[];
  }) {
    try {
      const patients = await this.getPatientsForClinic(args.clinicId, args.patientIds);
      const syncResults = [];

      for (const patient of patients) {
        if (!patient.calcom_access_token) {
          continue;
        }

        try {
          const bookings = await this.managedUserService.getUserBookings(patient);
          const syncedCount = await this.syncBookingsToDatabase(patient, bookings);

          syncResults.push({
            patientId: patient.id,
            success: true,
            syncedCount,
          });
        } catch (error) {
          syncResults.push({
            patientId: patient.id,
            success: false,
            error: `${error}`,
          });
        }
      }

      return {
        success: true,
        data: { syncResults },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to sync appointments: ${error}`,
      };
    }
  }

  private async getPatientFromDatabase(patientId: string): Promise<Patient | null> {
    return null;
  }

  private async getPatientsForClinic(
    clinicId: string,
    patientIds?: string[]
  ): Promise<Patient[]> {
    return [];
  }

  private async syncBookingsToDatabase(
    patient: Patient,
    bookings: any[]
  ): Promise<number> {
    return 0;
  }
}