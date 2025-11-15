'use client'

import { Target, Upload } from 'lucide-react'

export default function ResumeOptimizerPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resume Optimizer</h1>
        <p className="text-gray-600 mt-2">Optimize your resume for ATS systems and job applications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Resume */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Resume</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drop your resume here or click to browse</p>
            <p className="text-sm text-gray-500">Supports PDF, DOCX</p>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
          <textarea
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Paste the job description here..."
          />
          <button className="mt-4 w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700">
            Analyze & Optimize
          </button>
        </div>
      </div>

      {/* Results Placeholder */}
      <div className="mt-8 bg-white rounded-lg shadow p-8 text-center">
        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload a resume to get started</h3>
        <p className="text-gray-600">We'll analyze your resume and provide optimization suggestions</p>
      </div>
    </div>
  )
}
