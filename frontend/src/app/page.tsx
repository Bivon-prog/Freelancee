'use client'

import Link from 'next/link'
import { FileText, PenTool, FileSignature, Clock, Briefcase, Target } from 'lucide-react'

const tools = [
  {
    name: 'Invoice Generator',
    description: 'Create and manage professional invoices',
    icon: FileText,
    href: '/dashboard/invoices',
    color: 'bg-blue-500'
  },
  {
    name: 'AI Writing Assistant',
    description: 'Generate content, check grammar, and rewrite text',
    icon: PenTool,
    href: '/dashboard/writing',
    color: 'bg-purple-500'
  },
  {
    name: 'Contract Generator',
    description: 'Create professional contracts and proposals',
    icon: FileSignature,
    href: '/dashboard/contracts',
    color: 'bg-green-500'
  },
  {
    name: 'Time Tracking',
    description: 'Track hours and generate bills automatically',
    icon: Clock,
    href: '/dashboard/time-tracking',
    color: 'bg-orange-500'
  },
  {
    name: 'Resume Builder',
    description: 'Build professional resumes and portfolios',
    icon: Briefcase,
    href: '/dashboard/resume-builder',
    color: 'bg-pink-500'
  },
  {
    name: 'Resume Optimizer',
    description: 'Optimize your resume for ATS systems',
    icon: Target,
    href: '/dashboard/resume-optimizer',
    color: 'bg-indigo-500'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orbix</h1>
              <p className="text-xs text-gray-500">Smart Solutions for Your Work</p>
            </div>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link href="/auth/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          All Your Work Tools in One Place
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Streamline your workflow with our unified platform. From invoicing to AI-powered writing, 
          we've got everything you need to work smarter.
        </p>
        <Link href="/auth/register" className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 inline-block">
          Start Free Trial
        </Link>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Six Powerful Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <div key={tool.name} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{tool.name}</h4>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <Link href={tool.href} className="text-primary-600 font-medium hover:text-primary-700">
                  Learn more →
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Orbix</h3>
            <p className="text-gray-400">Smart Solutions for Your Work</p>
            <p className="text-gray-500 mt-4">© 2024 Orbix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
