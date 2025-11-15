'use client'

import { Briefcase, Plus } from 'lucide-react'

export default function ResumeBuilderPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
          <p className="text-gray-600 mt-2">Create professional resumes and portfolios</p>
        </div>
        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Resume</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No resumes yet</h3>
        <p className="text-gray-600 mb-6">Create your first professional resume</p>
        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700">
          Create Resume
        </button>
      </div>
    </div>
  )
}
