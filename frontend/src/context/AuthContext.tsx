import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { SigninRequest, SignupRequest } from '../types/api';

interface AuthUser {
  username: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: SigninRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('trello_token');
      const storedUsername = localStorage.getItem('trello_username');
      if (storedToken && storedUsername) {
        setToken(storedToken);
        setUser({
          username: storedUsername,
          token: storedToken,
        });
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: SigninRequest) => {
    const res = await authService.signin(data);
    const jwtToken = res.data.token;
    localStorage.setItem('trello_token', jwtToken);
    localStorage.setItem('trello_username', data.username);
    setToken(jwtToken);
    setUser({
      username: data.username,
      token: jwtToken,
    });
  };

  const signup = async (data: SignupRequest) => {
    await authService.signup(data);
  };

  const logout = () => {
    localStorage.removeItem('trello_token');
    localStorage.removeItem('trello_username');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
