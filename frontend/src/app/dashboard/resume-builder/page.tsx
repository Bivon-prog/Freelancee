'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Briefcase, Plus, Search, Eye, Edit, Download, Copy, Trash2, Star } from 'lucide-react'

interface Resume {
  id: string
  title: string
  templateId: string
  atsScore?: number
  updatedAt: string
  personalInfo?: {
    fullName: string
    email: string
  }
}

export default function ResumeBuilderPage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await resumesApi.getAll()
      // setResumes(response.data)
      
      // Mock data
      const mockResumes: Resume[] = [
        {
          id: '1',
          title: 'Software Engineer Resume',
          templateId: 'modern',
          atsScore: 85,
          updatedAt: '2024-11-15',
          personalInfo: {
            fullName: 'John Doe',
            email: 'john@example.com'
          }
        },
        {
          id: '2',
          title: 'Product Manager Resume',
          templateId: 'professional',
          atsScore: 92,
          updatedAt: '2024-11-10',
          personalInfo: {
            fullName: 'Jane Smith',
            email: 'jane@example.com'
          }
        },
        {
          id: '3',
          title: 'Designer Portfolio Resume',
          templateId: 'creative',
          atsScore: 78,
          updatedAt: '2024-11-05',
          personalInfo: {
            fullName: 'Alex Johnson',
            email: 'alex@example.com'
          }
        }
      ]
      setResumes(mockResumes)
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTemplateLabel = (templateId: string) => {
    const labels: Record<string, string> = {
      modern: 'Modern',
      professional: 'Professional',
      creative: 'Creative',
      minimal: 'Minimal',
      tech: 'Tech'
    }
    return labels[templateId] || templateId
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredResumes = resumes.filter(resume =>
    resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.personalInfo?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
          <p className="text-gray-600 mt-2">Create professional resumes and portfolios</p>
        </div>
        <Link 
          href="/dashboard/resume-builder/new"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Resume</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search resumes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Resumes Grid */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading resumes...</p>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No resumes found' : 'No resumes yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Try adjusting your search' : 'Create your first professional resume'}
          </p>
          <Link 
            href="/dashboard/resume-builder/new"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
          >
            Create Resume
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => (
            <div key={resume.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              {/* Preview Area */}
              <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 rounded-t-lg flex items-center justify-center relative">
                <Briefcase className="w-16 h-16 text-primary-300" />
                {resume.atsScore && (
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-sm">
                    <div className="flex items-center space-x-1">
                      <Star className={`w-4 h-4 ${getScoreColor(resume.atsScore)}`} />
                      <span className={`text-sm font-semibold ${getScoreColor(resume.atsScore)}`}>
                        {resume.atsScore}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resume.title}</h3>
                
                {resume.personalInfo && (
                  <div className="text-sm text-gray-600 mb-3">
                    <p className="font-medium">{resume.personalInfo.fullName}</p>
                    <p className="text-gray-500">{resume.personalInfo.email}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {getTemplateLabel(resume.templateId)}
                  </span>
                  <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/resume-builder/${resume.id}`}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  <button
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    className="p-2 border border-gray-300 rounded-lg hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {['Modern', 'Professional', 'Creative', 'Minimal', 'Tech'].map((template) => (
            <Link
              key={template}
              href="/dashboard/resume-builder/new"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
            >
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900">{template}</h3>
              <p className="text-sm text-gray-500 mt-1">Professional design</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
