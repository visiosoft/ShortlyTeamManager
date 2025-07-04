'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
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
  
  // Define pages that should NOT have the sidebar (public pages)
  const publicPages = ['/login', '/register', '/', '/not-found'];
  const isPublicPage = publicPages.includes(pathname || '');
  
  // Define pages that SHOULD have the sidebar (authenticated pages)
  const authenticatedPages = ['/dashboard', '/analytics', '/team-members', '/rewards', '/direct-links', '/team-urls'];
  const isAuthenticatedPage = authenticatedPages.includes(pathname || '');
  
  // Check if this is a short URL redirect (pathname like /YbZ8wA, /abc123, etc.)
  // Short URLs are typically 3-20 characters, alphanumeric with hyphens/underscores
  const isShortUrlRedirect = pathname && 
    pathname.length > 1 && 
    pathname.length <= 21 && // / + up to 20 characters
    pathname.startsWith('/') && 
    pathname !== '/' && 
    !authenticatedPages.includes(pathname) &&
    !publicPages.includes(pathname) &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/not-found') &&
    /^\/[a-zA-Z0-9_-]+$/.test(pathname);
  

  
  useEffect(() => {
    if (!isPublicPage && !isShortUrlRedirect) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [isPublicPage, isShortUrlRedirect]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };
  
  return (
    <div className={`${isPublicPage || isShortUrlRedirect ? '' : 'flex'} h-screen bg-gray-50`}>
      {/* Left Sidebar - Only show on authenticated pages */}
      {!isPublicPage && !isShortUrlRedirect && <Sidebar />}
      
      {/* Main Content */}
      <div className={`${isPublicPage || isShortUrlRedirect ? '' : 'flex-1 flex flex-col overflow-hidden'}`}>
        {/* Header with Logout Button - Only show on authenticated pages */}
        {!isPublicPage && !isShortUrlRedirect && (
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
        
        <main className={`${isPublicPage || isShortUrlRedirect ? '' : 'flex-1 overflow-y-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
} 