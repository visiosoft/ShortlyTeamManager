'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import Sidebar from './Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  
  // Check if current page is login, register, home page, or a short URL redirect
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';
  const isShortUrlRedirect = pathname.length > 1 && !pathname.startsWith('/') && !pathname.includes('/');
  
  useEffect(() => {
    if (!isAuthPage) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [isAuthPage]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };
  
  return (
    <div className={`${isAuthPage || isShortUrlRedirect ? '' : 'flex'} h-screen bg-gray-50`}>
      {/* Left Sidebar - Only show on authenticated pages */}
      {!isAuthPage && !isShortUrlRedirect && <Sidebar />}
      
      {/* Main Content */}
      <div className={`${isAuthPage || isShortUrlRedirect ? '' : 'flex-1 flex flex-col overflow-hidden'}`}>
        {/* Header with Logout Button - Only show on authenticated pages */}
        {!isAuthPage && !isShortUrlRedirect && (
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  {pathname === '/dashboard' && 'Dashboard'}
                  {pathname === '/analytics' && 'Analytics'}
                  {pathname === '/team-members' && 'Team Members'}
                  {pathname === '/rewards' && 'Rewards'}
                </h1>
              </div>
              
              {/* User Info and Logout Button */}
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-600">
                      Welcome, {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {user.role}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </header>
        )}
        
        <main className={`${isAuthPage || isShortUrlRedirect ? '' : 'flex-1 overflow-y-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
} 