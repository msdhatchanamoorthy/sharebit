'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getAuthToken, setAuthToken, clearAuthToken } from '@/lib/utils';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, location: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      setAuthToken(newToken);
      setToken(newToken);
      
      // Ensure user data includes role field
      const userWithRole = {
        ...userData,
        role: userData.role || 'user', // Default to 'user' if not provided
      };
      
      setUser(userWithRole);
      localStorage.setItem('user', JSON.stringify(userWithRole));
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, location: string) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        location,
      });

      const { token: newToken, user: userData } = response.data;

      setAuthToken(newToken);
      setToken(newToken);
      
      // Ensure user data includes role field (new users default to 'user')
      const userWithRole = {
        ...userData,
        role: userData.role || 'user',
      };
      
      setUser(userWithRole);
      localStorage.setItem('user', JSON.stringify(userWithRole));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
