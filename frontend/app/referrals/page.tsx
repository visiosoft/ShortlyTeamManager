'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api';

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalReferralEarnings: number;
  referralBonuses: Array<{
    userId: string;
    amount: number;
    currency: string;
    createdAt: string;
  }>;
}

interface UserReferralStats {
  totalReferrals: number;
  totalReferralEarnings: number;
  referralBonuses: Array<{
    userId: string;
    amount: number;
    currency: string;
    createdAt: string;
  }>;
  referredBy?: string;
  referralLink?: string;
  referralCode?: string;
}

interface ReferralSignup {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bonusAmount: number;
  currency: string;
  createdAt: string;
  referredAt: string;
}

export default function ReferralsPage() {
  const [teamStats, setTeamStats] = useState<ReferralStats | null>(null);
  const [userStats, setUserStats] = useState<UserReferralStats | null>(null);
  const [referralSignups, setReferralSignups] = useState<ReferralSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Get user role from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role);
    }
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchReferralStats();
    }
  }, [userRole]);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats and signups for all users
      const promises = [
        apiCall('/api/referrals/user-stats'),
        apiCall('/api/referrals/my-signups'),
        apiCall('/api/referrals/link') // Get referral link for all users
      ];
      
      // Fetch team stats for admin users
      if (userRole === 'admin') {
        promises.push(apiCall('/api/referrals/team-stats'));
      }
      
      const responses = await Promise.all(promises);
      
      const userData = await responses[0].json();
      const signupsData = await responses[1].json();
      const linkData = await responses[2].json();
      
      // Combine user stats with referral link data
      setUserStats({
        ...userData,
        referralLink: linkData.referralLink,
        referralCode: linkData.referralCode
      });
      setReferralSignups(signupsData);
      
      // Only set team stats for admin users
      if (userRole === 'admin' && responses[3]) {
        const teamData = await responses[3].json();
        setTeamStats(teamData);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      alert('Failed to load referral statistics');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      alert('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  };

  const shareReferralLink = async () => {
    const referralLink = teamStats?.referralLink || userStats?.referralLink;
    if (!referralLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my team on Shorly!',
          text: 'Sign up using my referral link and get 1000 PKR bonus!',
          url: referralLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
          <p className="mt-2 text-gray-600">
            Share your referral link and earn bonuses when people sign up!
          </p>
        </div>

        {/* Referral Link Section - Show for all users */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Link</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={teamStats?.referralLink || userStats?.referralLink || ''}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
            </div>
            <button
              onClick={() => copyToClipboard(teamStats?.referralLink || userStats?.referralLink || '')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={shareReferralLink}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Share
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Referral Code: <span className="font-mono font-semibold">{teamStats?.referralCode || userStats?.referralCode}</span>
          </p>
        </div>

        {/* Info Note - Only show for admin users */}
        {userRole === 'admin' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Team earnings show total bonuses for the entire team. Your earnings show only your personal bonuses from referrals.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className={`grid gap-6 mb-8 ${
          userRole === 'admin' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2'
        }`}>
          {/* Team Stats - Only show for admin users */}
          {userRole === 'admin' && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Referrals</h3>
                <p className="text-3xl font-bold text-blue-600">{teamStats?.totalReferrals || 0}</p>
                <p className="text-sm text-gray-500">Total referrals</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Earnings</h3>
                <p className="text-3xl font-bold text-green-600">PKR {teamStats?.totalReferralEarnings || 0}</p>
                <p className="text-sm text-gray-500">Total team earnings</p>
              </div>
            </>
          )}

          {/* User Stats - Show for all users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Referrals</h3>
            <p className="text-3xl font-bold text-purple-600">{userStats?.totalReferrals || 0}</p>
            <p className="text-sm text-gray-500">Your referrals</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Earnings</h3>
            <p className="text-3xl font-bold text-orange-600">PKR {userStats?.totalReferralEarnings || 0}</p>
            <p className="text-sm text-gray-500">Your personal earnings</p>
          </div>
        </div>

        {/* Your Referral Signups */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Signups</h2>
          {referralSignups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signup Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Your Bonus
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referralSignups.map((signup, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {signup.firstName} {signup.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {signup.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(signup.referredAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        +{signup.bonusAmount} {signup.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No referral signups yet. Start sharing your link!</p>
          )}
        </div>

        {/* Referral History - Only show for admin users */}
        {userRole === 'admin' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Referral History</h2>
            {teamStats?.referralBonuses && teamStats.referralBonuses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Currency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamStats.referralBonuses.map((bonus, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(bonus.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bonus.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bonus.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No referral bonuses yet. Start sharing your link!</p>
            )}
          </div>
        )}

        {/* How it works */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How the Referral Program Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-gray-600 text-sm">
                Copy and share your unique referral link with friends and family
              </p>
            </div>
                         <div className="text-center">
               <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-green-600 font-bold text-xl">2</span>
               </div>
               <h3 className="font-semibold text-gray-900 mb-2">They Join Your Team</h3>
               <p className="text-gray-600 text-sm">
                 When someone signs up using your link, they join your team and get 1000 PKR bonus
               </p>
             </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">You Earn</h3>
              <p className="text-gray-600 text-sm">
                You earn 500 PKR for each successful referral
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 