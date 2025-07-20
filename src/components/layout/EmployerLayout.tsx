import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface EmployerLayoutProps {
  children: React.ReactNode;
}

export function EmployerLayout({ children }: EmployerLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-64 flex-shrink-0 overflow-y-auto bg-white border-r border-gray-200">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}