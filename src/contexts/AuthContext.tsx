import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';
import api from '../lib/axios';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('access_token'),
    isAuthenticated: false,
    isLoading: true,
  });

  const navigate = useNavigate();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Prevent duplicate API calls
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    // Check token validity and restore session
    const token = localStorage.getItem('access_token');
    if (token) {
      // Verify token is still valid by making a test request
      api.get('profile/')
        .then(response => {
          setState(prev => ({ 
            ...prev, 
            user: response.data, 
            token,
            isAuthenticated: true, 
            isLoading: false 
          }));
        })
        .catch((error) => {
          // Token is invalid, clear it
          console.warn('Token validation failed:', error.message);
          localStorage.removeItem('access_token');
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('refresh');
          setState(prev => ({ 
            ...prev, 
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false 
          }));
        });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Send email & password as expected by backend
      const response = await api.post('token/', {
        email: credentials.email,
        password: credentials.password,
      });
      const { access: token, refresh: refreshToken } = response.data;
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('token', token); // Keep both for compatibility
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('refresh', refreshToken); // Keep both for compatibility
      }

      // Fetch user profile after login
      const userRes = await api.get('profile/');
      const user = userRes.data;
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      // Redirect based on role
      switch (user.user_type) {
        case 'university':
          navigate('/university/dashboard');
          break;
        case 'employer':
          navigate('/employer/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
      }
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('refresh');
      setState(prev => ({ ...prev, user: null, token: null, isAuthenticated: false, isLoading: false }));
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      await api.post('register/', credentials);
      // Optionally, auto-login after registration
      // await login({ email: credentials.email, password: credentials.password });
      setState(prev => ({ ...prev, isAuthenticated: false }));
      // Redirect to email verification or login page
      navigate('/login');
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('refresh');
      setState(prev => ({ ...prev, user: null, token: null, isAuthenticated: false, isLoading: false }));
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    navigate('/');
  };

  const resetPassword = async (email: string) => {
    // TODO: Implement password reset
    console.log('Password reset requested for:', email);
  };

  const verifyEmail = async (token: string) => {
    // TODO: Implement email verification
    console.log('Email verification with token:', token);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        resetPassword,
        verifyEmail,
      }}
    >
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