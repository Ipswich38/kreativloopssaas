import { CalcomClient } from './client';
import type { Patient } from '@/types';
import type { CreateManagedUserRequest, CalcomManagedUser } from './types';

export class ManagedUserService {
  private calcomClient: CalcomClient;

  constructor() {
    this.calcomClient = new CalcomClient();
  }

  async createManagedUserForPatient(
    patient: Patient,
    timezone: string = 'UTC'
  ): Promise<CalcomManagedUser> {
    if (!patient.email) {
      throw new Error('Patient must have an email to create a Cal.com managed user');
    }

    const userData: CreateManagedUserRequest = {
      email: patient.email,
      name: `${patient.first_name} ${patient.last_name}`,
      timezone,
      username: `patient_${patient.id.slice(0, 8)}`,
    };

    try {
      const response = await this.calcomClient.createManagedUser(userData);

      const managedUser: CalcomManagedUser = {
        id: response.user.id,
        email: response.user.email,
        username: response.user.username,
        name: response.user.name,
        timezone: response.user.timezone,
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        expiresAt: new Date(Date.now() + response.tokens.expiresIn * 1000),
      };

      return managedUser;
    } catch (error) {
      console.error('Failed to create Cal.com managed user:', error);
      throw new Error(`Failed to create Cal.com managed user: ${error}`);
    }
  }

  async refreshUserTokens(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    try {
      const response = await this.calcomClient.refreshAccessToken(refreshToken);

      return {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: new Date(Date.now() + response.expiresIn * 1000),
      };
    } catch (error) {
      console.error('Failed to refresh Cal.com tokens:', error);
      throw new Error(`Failed to refresh Cal.com tokens: ${error}`);
    }
  }

  async ensureValidAccessToken(patient: Patient): Promise<string> {
    if (!patient.calcom_access_token || !patient.calcom_refresh_token) {
      throw new Error('Patient does not have Cal.com credentials');
    }

    const expiresAt = patient.calcom_token_expires_at
      ? new Date(patient.calcom_token_expires_at)
      : new Date();

    if (expiresAt <= new Date()) {
      const refreshed = await this.refreshUserTokens(patient.calcom_refresh_token);

      patient.calcom_access_token = refreshed.accessToken;
      patient.calcom_refresh_token = refreshed.refreshToken;
      patient.calcom_token_expires_at = refreshed.expiresAt.toISOString();

      return refreshed.accessToken;
    }

    return patient.calcom_access_token;
  }

  async getUserEventTypes(patient: Patient) {
    const accessToken = await this.ensureValidAccessToken(patient);
    return this.calcomClient.getUserEventTypes(accessToken);
  }

  async getUserBookings(patient: Patient) {
    const accessToken = await this.ensureValidAccessToken(patient);
    return this.calcomClient.getUserBookings(accessToken);
  }

  async revokeUserAccess(patient: Patient): Promise<void> {
    if (!patient.calcom_access_token) {
      return;
    }

    try {
      await this.calcomClient.revokeToken(patient.calcom_access_token);
    } catch (error) {
      console.error('Failed to revoke Cal.com access:', error);
    }
  }
}