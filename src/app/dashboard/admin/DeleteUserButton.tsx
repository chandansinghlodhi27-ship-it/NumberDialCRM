'use client'

import { useState } from 'react'
import { deleteTelecaller } from './actions'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

export default function DeleteUserButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) return

    setLoading(true)
    const result = await deleteTelecaller(userId)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('User deleted successfully')
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 disabled:opacity-50 p-2 rounded-lg hover:bg-red-50 transition-colors"
      title="Delete User"
    >
      <Trash2 size={20} />
    </button>
  )
}
