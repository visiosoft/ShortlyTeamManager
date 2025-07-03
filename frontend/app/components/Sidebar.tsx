'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, BarChart3, Users, Link, TrendingUp, DollarSign, FileText, Plus, Shield } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  team?: {
    id: string;
    name: string;
    description?: string;
  };
  earnings?: {
    totalEarnings: number;
    currency: string;
  };
}

export default function Sidebar() {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">URL Shortener</h1>
        <p className="text-sm text-gray-600">Professional Link Management</p>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        {user ? (
          <>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {getInitials(user.firstName, user.lastName)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Current plan: Free</p>
              <button className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                Buy subscription
              </button>
            </div>
            {user.earnings && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 font-medium">
                  Earnings: {user.earnings.totalEarnings} {user.earnings.currency}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">General</h3>
          <div className="space-y-1">
            <NavItem 
              href="/dashboard" 
              icon={<BarChart3 className="w-4 h-4" />} 
              label="Dashboard" 
              isActive={pathname === '/dashboard'}
            />
            {user?.role !== 'admin' && (
              <NavItem 
                href="/direct-links" 
                icon={<Shield className="w-4 h-4" />} 
                label="Direct Links" 
                isActive={pathname === '/direct-links'}
              />
            )}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Team</h3>
          <div className="space-y-1">
            <NavItem 
              href="/team-members" 
              icon={<Users className="w-4 h-4" />} 
              label="Your Teams" 
              isActive={pathname === '/team-members'}
              disabled={user?.role !== 'admin'}
            />
            <NavItem 
              href="/team-urls" 
              icon={<Link className="w-4 h-4" />} 
              label="Create Team URL" 
              isActive={pathname === '/team-urls'}
              disabled={user?.role !== 'admin'}
            />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tools</h3>
          <div className="space-y-1">
            <NavItem 
              href="/analytics" 
              icon={<BarChart3 className="w-4 h-4" />} 
              label="Analytics" 
              isActive={pathname === '/analytics'}
            />
            <NavItem 
              href="/rewards" 
              icon={<DollarSign className="w-4 h-4" />} 
              label="Rewards" 
              isActive={pathname === '/rewards'}
              disabled={user?.role !== 'admin'}
            />
            <NavItem 
              href="/direct-links" 
              icon={<Link className="w-4 h-4" />} 
              label="Direct Links" 
              isActive={pathname === '/direct-links'}
              disabled={user?.role === 'admin'}
            />
            <NavItem 
              href="/dashboard" 
              icon={<Link className="w-4 h-4" />} 
              label="Link-in-bio" 
              isActive={false}
              disabled={true}
            />
            <NavItem 
              href="/dashboard" 
              icon={<FileText className="w-4 h-4" />} 
              label="Surveys" 
              isActive={false}
              disabled={true}
            />
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

// Navigation Item Component
function NavItem({ 
  href, 
  icon, 
  label, 
  isActive,
  disabled = false
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (!disabled) {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
        disabled
          ? 'text-gray-400 cursor-not-allowed opacity-50'
          : isActive 
            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className={
        disabled 
          ? 'text-gray-400' 
          : isActive 
            ? 'text-blue-600' 
            : 'text-gray-500'
      }>{icon}</span>
      <span>{label}</span>
    </button>
  );
} 