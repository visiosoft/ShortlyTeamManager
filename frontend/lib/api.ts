import axios from 'axios';

// API utility functions with centralized configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
};

// Helper function for API calls with error handling and CORS
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// API endpoints configuration
export const api = {
  // Auth endpoints
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    profile: '/api/auth/profile',
    teamMember: '/api/auth/team-member',
  },
  
  // URL endpoints
  urls: {
    create: '/api/urls',
    createAdmin: '/api/urls/admin',
    myUrls: '/api/urls/my-urls',
    assignedToMe: '/api/urls/assigned-to-me',
    teamUrls: '/api/urls/team-urls',
    userUrls: (userId: string) => `/api/urls/user/${userId}`,
    getById: (id: string) => `/api/urls/${id}`,
    delete: (id: string) => `/api/urls/${id}`,
    regenerate: (id: string) => `/api/urls/${id}/regenerate`,
    default: '/api/urls/default',
  },
  
  // User endpoints
  users: {
    profile: '/api/users/profile',
    teamMembers: '/api/users/team-members',
  },
  
  // Team endpoints
  teams: {
    create: '/api/teams',
    myTeam: '/api/teams/my-team',
    rewards: (id: string) => `/api/teams/${id}/rewards`,
    earnings: '/api/teams/my-earnings',
  },
  
  // Analytics endpoints
  analytics: {
    team: '/api/analytics/team',
    url: (urlId: string) => `/api/analytics/url/${urlId}`,
    user: (userId: string) => `/api/analytics/user/${userId}`,
    myTotalClicks: '/api/analytics/my-total-clicks',
    countries: '/api/analytics/countries',
    countriesDetailed: '/api/analytics/countries/detailed',
    userCountriesDetailed: '/api/analytics/user/countries/detailed',
    teamMembers: '/api/analytics/team-members',
    referrers: '/api/analytics/referrers',
    // Admin analytics endpoints
    admin: {
      teamTotalClicksMonth: '/api/analytics/admin/team-total-clicks-month',
      teamCountries: '/api/analytics/admin/team-countries',
      topTeamCountries: '/api/analytics/admin/top-team-countries',
    },
  },
  
  // Payment endpoints
  payments: {
    // User payment endpoints (only for non-admin users)
    paymentInfo: '/api/payments/payment-info',
    payouts: '/api/payments/payouts',
    // Admin payment endpoints
    admin: {
      teamPaymentInfo: '/api/payments/admin/team-payment-info',
      eligiblePayouts: '/api/payments/admin/eligible-payouts',
      processPayout: '/api/payments/admin/process-payout',
      allPayouts: '/api/payments/admin/payouts',
    },
  },
  
  // Platform endpoints
  platforms: {
    // Platform management
    create: '/api/platforms',
    getAll: '/api/platforms',
    getActive: '/api/platforms/active',
    getById: (id: string) => `/api/platforms/${id}`,
    update: (id: string) => `/api/platforms/${id}`,
    delete: (id: string) => `/api/platforms/${id}`,
    // Platform clicks
    addClicks: '/api/platforms/clicks',
    getAllClicks: '/api/platforms/clicks/all',
    getUserClicks: (userId: string) => `/api/platforms/clicks/user/${userId}`,
    getTeamClicks: (teamId: string) => `/api/platforms/clicks/team/${teamId}`,
    getClicksStats: '/api/platforms/clicks/stats',
    updateClicks: (clickId: string) => `/api/platforms/clicks/${clickId}`,
    deleteClicks: (clickId: string) => `/api/platforms/clicks/${clickId}`,
    // User-specific endpoints
    myClicks: '/api/platforms/clicks/my-clicks',
    myTeamClicks: '/api/platforms/clicks/my-team',
  },
};

export async function deletePlatform(id: string, token: string) {
  return axios.delete(`/api/platforms/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deletePlatformClick(clickId: string, token: string) {
  return axios.delete(`/api/platforms/clicks/${clickId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
} 