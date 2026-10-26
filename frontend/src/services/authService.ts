import { apiClient } from './apiClient';
import type { SigninRequest, SigninResponse, SignupRequest, SignupResponse } from '../types/api';

export const authService = {
  async signup(data: SignupRequest): Promise<SignupResponse> {
    const res = await apiClient.post<SignupResponse>('/signup', data);
    return res.data;
  },

  async signin(data: SigninRequest): Promise<SigninResponse> {
    const res = await apiClient.post<SigninResponse>('/signin', data);
    return res.data;
  },
};
