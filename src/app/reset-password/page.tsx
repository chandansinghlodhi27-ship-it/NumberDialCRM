'use client'

import { useState, useEffect } from 'react'
import { updatePassword } from './actions'
import { KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // When the user clicks the link in their email, Supabase sets a session via hash fragment
    // The middleware and client client handles parsing this.
    // We just verify if a session exists.
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Allow a small delay for hash exchange to happen via Supabase Client
        setTimeout(async () => {
          const { data: { session: delayedSession } } = await supabase.auth.getSession()
          if (!delayedSession) {
            setError("Invalid or expired password reset link. Please request a new one.")
          } else {
            setIsValidSession(true)
          }
          setCheckingSession(false)
        }, 1000)
      } else {
        setIsValidSession(true)
        setCheckingSession(false)
      }
    }
    
    checkSession()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)
    
    const result = await updatePassword(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600">
          <KeyRound size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Set New Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {!isValidSession ? (
             <div className="text-center">
                <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg mb-4">
                  {error}
                </div>
                <button
                  onClick={() => router.push('/forgot-password')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Request a new link
                </button>
             </div>
          ) : (
            <form action={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    name="confirm_password"
                    type="password"
                    required
                    minLength={6}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
