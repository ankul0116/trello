import { apiClient } from './apiClient';
import type { Board, CreateBoardResponse } from '../types/api';

export const boardService = {
  async getBoards(organizationId: string): Promise<Board[]> {
    try {
      const res = await apiClient.get<{ message: string; data: Board[] }>('/board', {
        params: { organizationId },
        data: { organizationId },
      });
      return res.data?.data || [];
    } catch (error: any) {
      if (error.message?.includes('not found') || error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async createBoard(organizationId: string, title: string): Promise<CreateBoardResponse> {
    const res = await apiClient.post<CreateBoardResponse>('/board', {
      organizationId,
      title,
    });
    return res.data;
  },
};
