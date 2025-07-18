import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import axios from 'axios';

interface ErrorState {
  error: string | null;
  isLoading: boolean;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleError = useCallback((error: any, defaultMessage: string = 'An error occurred') => {
    console.error('Error details:', {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
      stack: error?.stack
    });

    let errorMessage = defaultMessage;

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      switch (status) {
        case 400:
          errorMessage = data?.error || 'Invalid request. Please check your input and try again.';
          break;
        case 401:
          errorMessage = 'You need to be logged in to perform this action.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          if (data?.error?.includes('CV') || data?.error?.includes('cv')) {
            errorMessage = 'CV not found. Please upload your CV first.';
          } else {
            errorMessage = 'The requested resource was not found.';
          }
          break;
        case 413:
          errorMessage = 'File too large. Please upload a smaller file.';
          break;
        case 415:
          errorMessage = 'Unsupported file format. Please upload a PDF or Word document.';
          break;
        case 422:
          errorMessage = data?.error || 'Validation error. Please check your input.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = data?.error || defaultMessage;
      }
    } else if (error?.name === 'NetworkError' || error?.message?.includes('Network Error')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error?.name === 'TimeoutError' || error?.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please try again.';
    } else if (error?.message) {
      errorMessage = error.message;
    }

    setError(errorMessage);
    
    addToast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });

    return errorMessage;
  }, [addToast]);

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    defaultErrorMessage: string = 'An error occurred'
  ) => {
    return async (...args: T): Promise<R | undefined> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fn(...args);
        return result;
      } catch (err: any) {
        handleError(err, defaultErrorMessage);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    };
  }, [handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    error,
    isLoading,
    handleError,
    withErrorHandling,
    clearError,
    setLoading,
  };
}; 