'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Save, DollarSign, CreditCard, TrendingUp } from 'lucide-react'
import apiClient from '@/lib/axios'
import { api } from '@/lib/api'

interface PaymentInfo {
  id: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  branchCode?: string
  swiftCode?: string
  iban?: string
  currency: string
  thresholdAmount: number
  totalEarnings: number
  paidAmount: number
  pendingAmount: number
  isEligibleForPayout: boolean
  lastPayoutDate?: string
  lastPayoutAmount?: number
}

interface Payout {
  id: string
  amount: number
  currency: string
  period: string
  status: string
  processedAt: string
  notes?: string
  transactionId?: string
}

interface FormData {
  bankName: string
  accountNumber: string
  accountHolderName: string
  branchCode?: string
  swiftCode?: string
  iban?: string
  currency: string
}

export default function PaymentInfoPage() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>()

  const currency = watch('currency')

  useEffect(() => {
    loadPaymentInfo()
    loadPayouts()
  }, [])

  const loadPaymentInfo = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(api.payments.paymentInfo)
      setPaymentInfo(response.data)
      
      // Pre-fill form if payment info exists
      if (response.data) {
        setValue('bankName', response.data.bankName)
        setValue('accountNumber', response.data.accountNumber)
        setValue('accountHolderName', response.data.accountHolderName)
        setValue('branchCode', response.data.branchCode || '')
        setValue('swiftCode', response.data.swiftCode || '')
        setValue('iban', response.data.iban || '')
        setValue('currency', response.data.currency)
      }
    } catch (error: any) {
      console.error('Error loading payment info:', error)
      if (error.response?.status !== 404) {
        setError('Failed to load payment information')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadPayouts = async () => {
    try {
      const response = await apiClient.get(api.payments.payouts)
      setPayouts(response.data)
    } catch (error: any) {
      console.error('Failed to load payouts:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      console.log('Submitting payment info:', data)
      
      if (paymentInfo) {
        // Update existing payment info
        const response = await apiClient.put(api.payments.paymentInfo, data)
        console.log('Update response:', response.data)
        setSuccess('Payment information updated successfully!')
      } else {
        // Create new payment info
        const response = await apiClient.post(api.payments.paymentInfo, data)
        console.log('Create response:', response.data)
        setSuccess('Payment information saved successfully!')
      }
      
      // Reload payment info
      await loadPaymentInfo()
    } catch (error: any) {
      console.error('Error saving payment info:', error)
      setError(error.response?.data?.message || 'Failed to save payment information')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Information</h1>
          <p className="text-gray-600">Add your bank details to receive payouts when you reach the threshold</p>
        </div>

        {/* Earnings Summary */}
        {paymentInfo && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Earnings Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{paymentInfo.totalEarnings} {paymentInfo.currency}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">{paymentInfo.paidAmount} {paymentInfo.currency}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-blue-600">{paymentInfo.pendingAmount} {paymentInfo.currency}</p>
              </div>
            </div>
            {paymentInfo.isEligibleForPayout && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <p className="font-medium">🎉 You're eligible for payout!</p>
                <p className="text-sm">Your pending amount has reached the threshold.</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
            Bank Account Details
          </h2>

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <input
                  {...register('bankName', { required: 'Bank name is required' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., HBL Bank"
                />
                {errors.bankName && (
                  <p className="mt-1 text-sm text-red-600">{errors.bankName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  {...register('accountNumber', { required: 'Account number is required' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1234567890"
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountNumber.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name *
              </label>
              <input
                {...register('accountHolderName', { required: 'Account holder name is required' })}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., John Doe"
              />
              {errors.accountHolderName && (
                <p className="mt-1 text-sm text-red-600">{errors.accountHolderName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Code
                </label>
                <input
                  {...register('branchCode')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SWIFT Code
                </label>
                <input
                  {...register('swiftCode')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., HBLBPKKA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBAN
                </label>
                <input
                  {...register('iban')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., PK36HABB0000001123456702"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  {...register('currency', { required: 'Currency is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PKR">PKR (Pakistani Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                  <option value="GBP">GBP (British Pound)</option>
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : paymentInfo ? 'Update Payment Info' : 'Save Payment Info'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Payout History */}
        {payouts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Payout History
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                  {payouts.map((payout) => (
                    <tr key={payout.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payout.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payout.amount} {payout.currency}
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
    </div>
  )
} 