'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api, apiCall, getAuthHeaders } from '../../../lib/api';

interface Platform {
  _id: string;
  name: string;
  description: string;
  website?: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

interface PlatformClick {
  _id: string;
  platformId: { _id: string; name: string };
  userId: { _id: string; firstName: string; lastName: string; email: string };
  teamId: { _id: string; name: string };
  clicks: number;
  date: string;
  earnings: number;
  ratePerClick: number;
  notes?: string;
  addedBy: { _id: string; firstName: string; lastName: string };
  createdAt: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  teamId: { _id: string; name: string; rewards?: Array<{ clicks: number; amount: number; currency: string }> };
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformClicks, setPlatformClicks] = useState<PlatformClick[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'platforms' | 'clicks'>('platforms');
  
  // Platform form state
  const [showPlatformForm, setShowPlatformForm] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [platformForm, setPlatformForm] = useState({
    name: '',
    description: '',
    website: '',
    type: 'external',
    isActive: true
  });

  // Click form state
  const [showClickForm, setShowClickForm] = useState(false);
  const [clickForm, setClickForm] = useState({
    platformId: '',
    userId: '',
    clicks: 0,
    date: new Date().toISOString().split('T')[0],
    ratePerClick: 0.5,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [platformsRes, clicksRes, usersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'}/api/platforms`, {
          headers: getAuthHeaders()
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'}/api/platforms/clicks/all`, {
          headers: getAuthHeaders()
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'}/api/users/team-members`, {
          headers: getAuthHeaders()
        })
      ]);
      
      const platformsData = await platformsRes.json();
      const clicksData = await clicksRes.json();
      const usersData = await usersRes.json();
      
      // Handle API errors - if response is not ok, set empty arrays
      if (platformsRes.ok) {
        setPlatforms(Array.isArray(platformsData) ? platformsData : []);
      } else {
        console.error('Platforms API error:', platformsData);
        setPlatforms([]);
      }
      
      if (clicksRes.ok) {
        setPlatformClicks(Array.isArray(clicksData) ? clicksData : []);
      } else {
        console.error('Clicks API error:', clicksData);
        setPlatformClicks([]);
      }
      
      if (usersRes.ok) {
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        console.error('Users API error:', usersData);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlatform) {
        await apiCall(api.platforms.update(editingPlatform._id), {
          method: 'PUT',
          body: JSON.stringify(platformForm)
        });
      } else {
        await apiCall(api.platforms.create, {
          method: 'POST',
          body: JSON.stringify(platformForm)
        });
      }
      
      setShowPlatformForm(false);
      setEditingPlatform(null);
      setPlatformForm({
        name: '',
        description: '',
        website: '',
        type: 'external',
        isActive: true
      });
      fetchData();
    } catch (error) {
      console.error('Error saving platform:', error);
    }
  };

  const handleClickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall(api.platforms.addClicks, {
        method: 'POST',
        body: JSON.stringify(clickForm)
      });
      setShowClickForm(false);
      setClickForm({
        platformId: '',
        userId: '',
        clicks: 0,
        date: new Date().toISOString().split('T')[0],
        ratePerClick: 0.5,
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error adding clicks:', error);
    }
  };

  const deletePlatform = async (id: string) => {
    if (!confirm('Are you sure you want to delete this platform?')) return;
    
    try {
      await apiCall(api.platforms.delete(id), {
        method: 'DELETE'
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting platform:', error);
    }
  };

  const editPlatform = (platform: Platform) => {
    setEditingPlatform(platform);
    setPlatformForm({
      name: platform.name,
      description: platform.description,
      website: platform.website || '',
      type: platform.type,
      isActive: platform.isActive
    });
    setShowPlatformForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  const getTeamRewardRate = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (!user || !user.teamId.rewards || user.teamId.rewards.length === 0) {
      return 0.5; // Default rate
    }
    
    const reward = user.teamId.rewards[0];
    if (reward && reward.clicks > 0) {
      return reward.amount / reward.clicks;
    }
    
    return 0.5; // Default rate
  };

  const getTeamRewardInfo = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (!user || !user.teamId.rewards || user.teamId.rewards.length === 0) {
      return null;
    }
    
    const reward = user.teamId.rewards[0];
    if (reward && reward.clicks > 0) {
      return {
        rate: reward.amount / reward.clicks,
        description: `${reward.amount} PKR per ${reward.clicks} clicks`
      };
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Management</h1>
        <p className="text-gray-600">Manage external platforms and track user clicks</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('platforms')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'platforms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Platforms
            </button>
            <button
              onClick={() => setActiveTab('clicks')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'clicks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Platform Clicks
            </button>
          </nav>
        </div>
      </div>

      {/* Platforms Tab */}
      {activeTab === 'platforms' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">External Platforms</h2>
            <button
              onClick={() => setShowPlatformForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Platform</span>
            </button>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(Array.isArray(platforms) ? platforms : []).map((platform) => (
                    <tr key={platform._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{platform.name}</div>
                          {platform.website && (
                            <div className="text-sm text-gray-500">{platform.website}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{platform.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {platform.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          platform.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {platform.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editPlatform(platform)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePlatform(platform._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Platform Clicks Tab */}
      {activeTab === 'clicks' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Platform Clicks</h2>
            <button
              onClick={() => setShowClickForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Clicks</span>
            </button>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(Array.isArray(platformClicks) ? platformClicks : []).map((click) => (
                    <tr key={click._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {click.platformId.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {click.userId.firstName} {click.userId.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{click.userId.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{click.clicks}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(click.ratePerClick)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(click.earnings)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(click.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {click.addedBy.firstName} {click.addedBy.lastName}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Platform Form Modal */}
      {showPlatformForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPlatform ? 'Edit Platform' : 'Add New Platform'}
              </h3>
              <form onSubmit={handlePlatformSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={platformForm.name}
                    onChange={(e) => setPlatformForm({ ...platformForm, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={platformForm.description}
                    onChange={(e) => setPlatformForm({ ...platformForm, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website (Optional)</label>
                  <input
                    type="url"
                    value={platformForm.website}
                    onChange={(e) => setPlatformForm({ ...platformForm, website: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={platformForm.type}
                    onChange={(e) => setPlatformForm({ ...platformForm, type: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="external">External</option>
                    <option value="internal">Internal</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={platformForm.isActive}
                    onChange={(e) => setPlatformForm({ ...platformForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlatformForm(false);
                      setEditingPlatform(null);
                      setPlatformForm({
                        name: '',
                        description: '',
                        website: '',
                        type: 'external',
                        isActive: true
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {editingPlatform ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Click Form Modal */}
      {showClickForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Platform Clicks</h3>
              <form onSubmit={handleClickSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Platform</label>
                  <select
                    value={clickForm.platformId}
                    onChange={(e) => setClickForm({ ...clickForm, platformId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Platform</option>
                    {platforms.filter(p => p.isActive).map((platform) => (
                      <option key={platform._id} value={platform._id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <select
                    value={clickForm.userId}
                    onChange={(e) => setClickForm({ ...clickForm, userId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Clicks</label>
                  <input
                    type="number"
                    value={clickForm.clicks}
                    onChange={(e) => setClickForm({ ...clickForm, clicks: parseInt(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={clickForm.date}
                    onChange={(e) => setClickForm({ ...clickForm, date: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rate per Click (PKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={clickForm.ratePerClick}
                    onChange={(e) => setClickForm({ ...clickForm, ratePerClick: parseFloat(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                  <textarea
                    value={clickForm.notes}
                    onChange={(e) => setClickForm({ ...clickForm, notes: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClickForm(false);
                      setClickForm({
                        platformId: '',
                        userId: '',
                        clicks: 0,
                        date: new Date().toISOString().split('T')[0],
                        ratePerClick: 0.5,
                        notes: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Add Clicks
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 