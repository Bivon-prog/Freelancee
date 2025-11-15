'use client'

import { useState } from 'react'
import { Target, Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Sparkles, Download, Copy } from 'lucide-react'

interface AnalysisResult {
  atsScore: number
  keywords: {
    found: string[]
    missing: string[]
  }
  suggestions: string[]
  strengths: string[]
  improvements: string[]
}

export default function ResumeOptimizerPage() {
  const [step, setStep] = useState<'upload' | 'analyze' | 'results'>('upload')
  const [loading, setLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
      // TODO: Extract text from PDF/DOCX
      setResumeText('Sample resume text extracted from file...')
    }
  }

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) {
      alert('Please upload a resume and paste a job description')
      return
    }

    setLoading(true)
    setStep('analyze')

    try {
      // TODO: Call AI service for analysis
      // const response = await aiApi.optimizeResume({ resumeText, jobDescription })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock analysis result
      const mockResult: AnalysisResult = {
        atsScore: 78,
        keywords: {
          found: ['JavaScript', 'React', 'Node.js', 'Team Leadership', 'Agile'],
          missing: ['TypeScript', 'AWS', 'Docker', 'CI/CD', 'Microservices']
        },
        suggestions: [
          'Add more quantifiable achievements with specific metrics',
          'Include relevant keywords from the job description',
          'Use stronger action verbs at the beginning of bullet points',
          'Expand on your technical skills section',
          'Add a professional summary at the top'
        ],
        strengths: [
          'Clear work experience timeline',
          'Good use of action verbs',
          'Relevant education background',
          'Professional formatting'
        ],
        improvements: [
          'Missing key technical skills mentioned in job description',
          'Lack of quantifiable metrics in achievements',
          'Professional summary could be more impactful',
          'Some bullet points are too generic'
        ]
      }
      
      setAnalysisResult(mockResult)
      setStep('results')
    } catch (error) {
      console.error('Error analyzing resume:', error)
      alert('Failed to analyze resume')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resume Optimizer</h1>
        <p className="text-gray-600 mt-2">Optimize your resume for ATS systems and job applications</p>
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Upload */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Your Resume</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {resumeFile ? resumeFile.name : 'Drop your resume here or click to browse'}
                </p>
                <p className="text-sm text-gray-500">Supports PDF, DOCX (Max 5MB)</p>
              </label>
            </div>

            {resumeFile && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">{resumeFile.name}</p>
                  <p className="text-xs text-green-700">Ready to analyze</p>
                </div>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <p className="text-sm text-gray-600 mb-4">
              Paste the job description to match your resume against specific requirements
            </p>
            
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Paste the complete job description here..."
            />

            <button
              onClick={handleAnalyze}
              disabled={!resumeFile || !jobDescription}
              className="mt-4 w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Analyze Resume</span>
            </button>
          </div>
        </div>
      )}

      {/* Analyzing Step */}
      {step === 'analyze' && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Analyzing Your Resume</h3>
          <p className="text-gray-600 mb-8">Our AI is reviewing your resume and comparing it with the job requirements...</p>
          
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-700">Extracting text from document</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-700">Analyzing job description</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-6 h-6 rounded-full bg-primary-500 animate-pulse"></div>
              <span className="text-gray-700">Matching keywords and skills</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-6 h-6 rounded-full bg-gray-300"></div>
              <span className="text-gray-400">Calculating ATS score</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-6 h-6 rounded-full bg-gray-300"></div>
              <span className="text-gray-400">Generating suggestions</span>
            </div>
          </div>
        </div>
      )}

      {/* Results Step */}
      {step === 'results' && analysisResult && (
        <div className="space-y-6">
          {/* ATS Score Card */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">ATS Compatibility Score</h2>
                <p className="text-gray-600">How well your resume matches the job requirements</p>
              </div>
              <div className={`text-center ${getScoreBgColor(analysisResult.atsScore)} rounded-lg p-6`}>
                <div className={`text-5xl font-bold ${getScoreColor(analysisResult.atsScore)}`}>
                  {analysisResult.atsScore}
                </div>
                <div className="text-sm text-gray-600 mt-1">out of 100</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    analysisResult.atsScore >= 80 ? 'bg-green-500' :
                    analysisResult.atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysisResult.atsScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>

          {/* Keywords Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Keywords Found</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.keywords.found.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Missing Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.keywords.missing.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Improvement Suggestions</h3>
            </div>
            <ul className="space-y-3">
              {analysisResult.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strengths and Improvements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Strengths</h3>
              <ul className="space-y-2">
                {analysisResult.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Areas to Improve</h3>
              <ul className="space-y-2">
                {analysisResult.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setStep('upload')
                  setResumeFile(null)
                  setJobDescription('')
                  setAnalysisResult(null)
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Analyze Another Resume
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">
                <Download className="w-5 h-5" />
                <span>Download Report</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                <FileText className="w-5 h-5" />
                <span>Optimize in Resume Builder</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
