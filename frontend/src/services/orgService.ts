import { apiClient } from './apiClient';
import type { CreateOrgRequest, CreateOrgResponse, Organization, WorkspaceMember } from '../types/api';

export const orgService = {
  async getOrganizations(): Promise<Organization[]> {
    try {
      const res = await apiClient.get<{ message: string; data: Organization[] }>('/organization');
      return res.data?.data || [];
    } catch (error: any) {
      // Backend returns 404 when user has no organizations yet
      if (error.message?.includes('No organization found') || error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async createOrganization(data: CreateOrgRequest): Promise<CreateOrgResponse> {
    const res = await apiClient.post<CreateOrgResponse>('/organization', data);
    return res.data;
  },

  async deleteOrganization(organizationId: string): Promise<void> {
    await apiClient.delete('/organization', {
      data: { organizationId },
    });
  },

  async getMembers(organizationId: string): Promise<WorkspaceMember[]> {
    try {
      const res = await apiClient.get<{
        data: string[];
        memberDetails?: WorkspaceMember[];
      }>('/member', {
        params: { organizationId },
        data: { organizationId },
      });
      return res.data?.memberDetails || (res.data?.data || []).map((id) => ({
        id,
        username: 'Member',
      }));
    } catch (error: any) {
      if (error.message?.includes('not found') || error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async addMember(organizationId: string, memberUserUsername: string): Promise<void> {
    await apiClient.post('/member', {
      organizationId,
      memberUserUsername,
    });
  },

  async removeMember(organizationId: string, memberId: string): Promise<void> {
    await apiClient.delete('/member', {
      data: { organizationId, memberId },
    });
  },
};
