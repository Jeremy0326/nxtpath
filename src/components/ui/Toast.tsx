import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast as ToastType, ToastVariant } from '../../hooks/useToast';

interface ToastProps extends ToastType {
  onRemove: (id: string) => void;
}

export function Toast({ id, title, description, variant = 'default', onRemove }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`rounded-lg shadow-lg p-4 mb-4 min-w-[300px] max-w-md ${
        variant === 'destructive'
          ? 'bg-red-50 border border-red-200'
          : 'bg-white border border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3
            className={`text-sm font-medium ${
              variant === 'destructive' ? 'text-red-800' : 'text-gray-900'
            }`}
          >
            {title}
          </h3>
          {description && (
            <p
              className={`mt-1 text-sm ${
                variant === 'destructive' ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              {description}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(id)}
          className={`ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none ${
            variant === 'destructive' ? 'hover:text-red-500' : ''
          }`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-0 right-0 p-4 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
} 