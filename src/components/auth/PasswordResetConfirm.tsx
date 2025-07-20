import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';

export function PasswordResetConfirm() {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!uidb64 || !token) {
        setError('Invalid reset link.');
        setIsValidating(false);
        return;
      }

      try {
        const response = await api.get(`/auth/reset-password/validate/${uidb64}/${token}/`);
        setIsValidToken(response.data.valid);
      } catch (err: any) {
        console.error('Token validation error:', err);
        setIsValidToken(false);
        setError('Invalid or expired reset link.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [uidb64, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/reset-password/confirm/', {
        uidb64,
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset confirmation error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.new_password) {
        setError(err.response.data.new_password[0]);
      } else if (err.response?.data?.confirm_password) {
        setError(err.response.data.confirm_password[0]);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || '',
    };
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Validating reset link...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Invalid reset link
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {error || 'This password reset link is invalid or has expired.'}
            </p>
          </div>
          <div className="text-center">
            <button
              onClick={() => navigate('/forgot-password')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Request a new reset link
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Password reset successful
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </div>
          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter new password"
                value={formData.new_password}
                onChange={handleChange}
              />
              {formData.new_password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Resetting...' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 