'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link, Copy, RefreshCw, ExternalLink, Shield } from 'lucide-react';

interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  isActive: boolean;
  title?: string;
  description?: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }
  isAdminCreated: boolean;
  createdByAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }
  createdAt: string;
  updatedAt: string;
  teamId?: string;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  team: {
    id: string;
    name: string;
    description?: string;
  }
}

export default function DirectLinksPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    fetchDirectLinks();
  }, [router]);

  const fetchDirectLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3009/api/urls/team-urls', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter admin-created URLs - show all for admins, only for user's team for regular users
        const adminCreatedUrls = data.urls.filter((url: UrlData) => {
          const isAdminCreated = url.isAdminCreated;
          if (user?.role === 'admin') {
            return isAdminCreated;
          } else if (user?.role === 'user') {
            // Show admin-created URLs for the user's team
            return isAdminCreated && url.teamId?.toString() === user.team?.id?.toString();
          }
          return false;
        });
        setUrls(adminCreatedUrls);
      } else {
        console.error('Failed to fetch direct links');
      }
    } catch (error) {
      console.error('Error fetching direct links:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const regenerateShortUrl = async (urlId: string) => {
    setRegenerating(urlId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3009/api/urls/${urlId}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedUrl = await response.json();
        setUrls(prev => prev.map(url => 
          url.id === urlId ? updatedUrl : url
        ));
      } else {
        alert('Failed to regenerate short URL');
      }
    } catch (error) {
      console.error('Error regenerating URL:', error);
      alert('Error regenerating short URL');
    } finally {
      setRegenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Direct Links</h1>
            <p className="text-gray-600 mt-2">
              URLs created by admins for team members. Original URLs are hidden for security.
            </p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => router.push('/team-urls')}
              className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Link className="h-4 w-4" />
              <span>Create New Direct Link</span>
            </button>
          )}
        </div>

        {urls.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Direct Links Found</h3>
            <p className="text-gray-600 mb-4">
              {user?.role === 'admin' 
                ? "You haven't created any direct links for your team members yet."
                : "No direct links have been created for your team by your admin yet. If your admin creates a direct link for your team, it will appear here."
              }
            </p>
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push('/team-urls')}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Your First Direct Link
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {urls.map((url) => (
              <div key={url.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span className="font-mono text-lg font-medium text-blue-900">
                        {url.shortUrl}
                      </span>
                      <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        <Shield className="h-3 w-3" />
                        <span>Admin Created</span>
                      </div>
                    </div>
                    
                    {url.title && (
                      <p className="text-sm font-medium text-gray-800 mb-1">{url.title}</p>
                    )}
                    {url.description && (
                      <p className="text-sm text-gray-600 mb-2">{url.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Link className="h-4 w-4" />
                        <span>{url.clicks} clicks</span>
                      </div>
                      {url.user && (
                        <div className="flex items-center space-x-1">
                          <span>Assigned to: {url.user.firstName} {url.user.lastName}</span>
                        </div>
                      )}
                      {url.createdByAdmin && (
                        <div className="flex items-center space-x-1">
                          <Shield className="h-4 w-4" />
                          <span>By {url.createdByAdmin.firstName} {url.createdByAdmin.lastName}</span>
                        </div>
                      )}
                      <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(url.shortUrl, url.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Copy URL"
                    >
                      {copied === url.id ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => regenerateShortUrl(url.id)}
                      disabled={regenerating === url.id}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Regenerate Short URL"
                    >
                      {regenerating === url.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                      ) : (
                        <RefreshCw className="h-5 w-5" />
                      )}
                    </button>
                    
                    <a
                      href={url.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Open URL"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 