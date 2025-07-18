import React from 'react';
import { Card } from './Card';

interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ value, onChange, children }: TabsProps) {
  return (
    <Card className="overflow-hidden">
      {children}
    </Card>
  );
}

interface TabListProps {
  children: React.ReactNode;
}

export function TabList({ children }: TabListProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="px-4 -mb-px flex space-x-8" aria-label="Tabs">
        {children}
      </nav>
    </div>
  );
}

interface TabProps {
  value: string;
  currentValue: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tab({ value, currentValue, onChange, children }: TabProps) {
  const isActive = currentValue === value;
  return (
    <button
      onClick={() => onChange(value)}
      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
        ${isActive
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  tab: string;
  children: React.ReactNode;
}

export function TabPanel({ value, tab, children }: TabPanelProps) {
  if (value !== tab) return null;
  return <div className="p-6">{children}</div>;
}