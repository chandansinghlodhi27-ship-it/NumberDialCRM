'use client'

import { useState } from 'react'
import { createTelecaller } from './actions'
import toast from 'react-hot-toast'

export default function CreateUserForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const result = await createTelecaller(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Telecaller created successfully')
      // Reset form (could use a ref, but simple approach here)
      const form = document.getElementById('create-user-form') as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <form id="create-user-form" action={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Telecaller</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Full Name</label>
          <input required name="full_name" type="text" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email Address</label>
          <input required name="email" type="email" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Mobile Number</label>
          <input required name="mobile_number" type="tel" pattern="[0-9]{10}" title="Please enter exactly 10 digits" maxLength={10} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. 9876543210" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input required name="password" type="password" minLength={6} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </form>
  )
}
