'use client'

import { FileSignature, Plus } from 'lucide-react'

export default function ContractsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts & Proposals</h1>
          <p className="text-gray-600 mt-2">Generate professional contracts and business proposals</p>
        </div>
        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Contract</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <FileSignature className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No contracts yet</h3>
        <p className="text-gray-600 mb-6">Create your first contract or proposal</p>
        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700">
          Create Contract
        </button>
      </div>
    </div>
  )
}
