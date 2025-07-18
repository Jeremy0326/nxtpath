import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Rocket, User } from 'lucide-react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setDropdownOpen(false);
    if (!user) return;
    if (user.role === 'student') navigate('/student/profile');
    else if (user.role === 'employer') navigate('/employer/profile');
    else if (user.role === 'university') navigate('/university/profile');
    else navigate('/profile');
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <Link to="/" className="flex items-center space-x-2">
            <Rocket className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-indigo-600">NxtPath AI</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 px-4 py-2 pl-10 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/messages" className="relative">
                <Bell className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </Link>
              {/* Profile Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => setDropdownOpen((open) => !open)}
                  aria-label="Open profile menu"
                >
                  <User className="h-5 w-5 text-gray-500" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100 animate-fade-in">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleProfileClick}
                    >
                      Profile
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                    >
                      Settings
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={() => { setDropdownOpen(false); /* add logout logic here */ }}
                    >
                      Logout
                    </button>
                  </div>
                )}
                </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}