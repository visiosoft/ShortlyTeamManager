'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle, DollarSign, Users, TrendingUp } from 'lucide-react'
import apiClient from '@/lib/axios'
import { api } from '@/lib/api'

interface PaymentInfo {
  id: string
  userId: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  teamId: {
    name: string
  }
  bankName: string
  accountNumber: string
  accountHolderName: string
  currency: string
  totalEarnings: number
  paidAmount: number
  pendingAmount: number
  thresholdAmount: number
  isEligibleForPayout: boolean
  lastPayoutDate?: string
  lastPayoutAmount?: number
}

interface Payout {
  id: string
  userId: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  teamId: {
    name: string
  }
  amount: number
  currency: string
  period: string
  status: string
  processedAt: string
  notes?: string
  transactionId?: string
}

interface ProcessPayoutForm {
  amount: number
  period: string
  notes?: string
  transactionId?: string
}

export default function AdminPayoutsPage() {
  const [paymentInfoList, setPaymentInfoList] = useState<PaymentInfo[]>([])
  const [eligiblePayouts, setEligiblePayouts] = useState<PaymentInfo[]>([])
  const [allPayouts, setAllPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedUser, setSelectedUser] = useState<PaymentInfo | null>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false)
  const [selectedBankUser, setSelectedBankUser] = useState<PaymentInfo | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProcessPayoutForm>()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Loading admin payout data...')
      
      const [paymentInfoResponse, eligibleResponse, payoutsResponse] = await Promise.all([
        apiClient.get(api.payments.admin.teamPaymentInfo),
        apiClient.get(api.payments.admin.eligiblePayouts),
        apiClient.get(api.payments.admin.allPayouts),
      ])

      console.log('Payment info response:', paymentInfoResponse.data)
      console.log('Eligible payouts response:', eligibleResponse.data)
      console.log('All payouts response:', payoutsResponse.data)

      setPaymentInfoList(paymentInfoResponse.data)
      setEligiblePayouts(eligibleResponse.data)
      setAllPayouts(payoutsResponse.data)
    } catch (error: any) {
      console.error('Error loading admin payout data:', error)
      setError('Failed to load payment data: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayout = (user: PaymentInfo) => {
    setSelectedUser(user)
    setValue('amount', user.pendingAmount)
    setValue('period', new Date().toISOString().slice(0, 7)) // YYYY-MM format
    setShowProcessModal(true)
  }

  const handleViewBankDetails = (user: PaymentInfo) => {
    setSelectedBankUser(user)
    setShowBankDetailsModal(true)
  }

  const onSubmitPayout = async (data: ProcessPayoutForm) => {
    if (!selectedUser) return

    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      console.log('Processing payout for user:', selectedUser.userId)
      console.log('Payout data:', data)
      
      await apiClient.post(api.payments.admin.processPayout, {
        userId: selectedUser.userId.id || selectedUser.id,
        ...data,
      })

      setSuccess('Payout processed successfully!')
      setShowProcessModal(false)
      setSelectedUser(null)
      reset()
      
      // Reload data
      await loadData()
    } catch (error: any) {
      console.error('Error processing payout:', error)
      setError(error.response?.data?.message || 'Failed to process payout')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Payout Management</h1>
          <p className="text-gray-600">Manage team members' payouts and bank information</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{paymentInfoList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Eligible for Payout</p>
                <p className="text-2xl font-bold text-gray-900">{eligiblePayouts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                <p className="text-2xl font-bold text-gray-900">{allPayouts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Eligible Payouts */}
        {eligiblePayouts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Users Eligible for Payout
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eligiblePayouts.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.userId?.firstName} {user.userId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.userId?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.teamId?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>{user.bankName}</div>
                          <div className="text-gray-500">****{user.accountNumber?.slice(-4)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.totalEarnings} {user.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
                          {user.pendingAmount} {user.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewBankDetails(user)}
                            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-all text-sm"
                          >
                            View Bank Details
                          </button>
                          <button
                            onClick={() => handleProcessPayout(user)}
                            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all"
                          >
                            Process Payout
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Payment Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            All Payment Information
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
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
                {paymentInfoList.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.userId?.firstName} {user.userId?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.userId?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.teamId?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{user.bankName}</div>
                        <div className="text-gray-500">****{user.accountNumber?.slice(-4)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.totalEarnings} {user.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                        user.isEligibleForPayout 
                          ? 'text-green-800 bg-green-100' 
                          : 'text-yellow-800 bg-yellow-100'
                      }`}>
                        {user.isEligibleForPayout ? 'Eligible' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewBankDetails(user)}
                          className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-all text-sm"
                        >
                          View Bank Details
                        </button>
                        {user.isEligibleForPayout && (
                          <button
                            onClick={() => handleProcessPayout(user)}
                            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all"
                          >
                            Process Payout
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout History */}
        {allPayouts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Payout History
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allPayouts.map((payout) => (
                    <tr key={payout.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payout.userId?.firstName} {payout.userId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{payout.userId?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payout.teamId?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payout.amount} {payout.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payout.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payout.status === 'processed' ? 'bg-green-100 text-green-800' :
                          payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payout.processedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Process Payout Modal */}
      {showProcessModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Payout</h3>
            <p className="text-sm text-gray-600 mb-6">
              Process payout for {selectedUser.userId?.firstName} {selectedUser.userId?.lastName}
            </p>
            
            <form onSubmit={handleSubmit(onSubmitPayout)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({selectedUser.currency})
                </label>
                <input
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0, message: 'Amount must be at least 0' }
                  })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period (YYYY-MM)
                </label>
                <input
                  {...register('period', { required: 'Period is required' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2024-01"
                />
                {errors.period && (
                  <p className="mt-1 text-sm text-red-600">{errors.period.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Transaction notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID (Optional)
                </label>
                <input
                  {...register('transactionId')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="TXN123456"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProcessModal(false)
                    setSelectedUser(null)
                    reset()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-green-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {processing ? 'Processing...' : 'Process Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {showBankDetailsModal && selectedBankUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
            <p className="text-sm text-gray-600 mb-6">
              Complete bank information for {selectedBankUser.userId?.firstName} {selectedBankUser.userId?.lastName}
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedBankUser.bankName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">{selectedBankUser.accountNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedBankUser.accountHolderName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedBankUser.currency}</p>
                </div>
                {selectedBankUser.branchCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedBankUser.branchCode}</p>
                  </div>
                )}
                {selectedBankUser.swiftCode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT Code</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">{selectedBankUser.swiftCode}</p>
                  </div>
                )}
                {selectedBankUser.iban && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono">{selectedBankUser.iban}</p>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Earnings Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Total Earnings</label>
                    <p className="text-sm font-semibold text-gray-900">{selectedBankUser.totalEarnings} {selectedBankUser.currency}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Paid Amount</label>
                    <p className="text-sm font-semibold text-green-600">{selectedBankUser.paidAmount} {selectedBankUser.currency}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pending Amount</label>
                    <p className="text-sm font-semibold text-blue-600">{selectedBankUser.pendingAmount} {selectedBankUser.currency}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowBankDetailsModal(false)
                  setSelectedBankUser(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedBankUser.isEligibleForPayout && (
                <button
                  onClick={() => {
                    setShowBankDetailsModal(false)
                    setSelectedBankUser(null)
                    handleProcessPayout(selectedBankUser)
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all"
                >
                  Process Payout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 