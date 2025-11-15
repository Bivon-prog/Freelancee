'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileSignature, Briefcase, Users, Home, Lightbulb, Save, Send, Sparkles } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  type: string
  icon: any
}

interface Party {
  name: string
  role: string
  email: string
}

export default function NewContractPage() {
  const router = useRouter()
  const [step, setStep] = useState<'template' | 'details' | 'content'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    parties: [
      { name: '', role: 'Client', email: '' },
      { name: '', role: 'Contractor', email: '' }
    ],
    terms: {
      startDate: '',
      endDate: '',
      payment: '',
      deliverables: ['']
    },
    content: ''
  })

  const templates: Template[] = [
    {
      id: 'freelance',
      name: 'Freelance Contract',
      description: 'Standard freelance service agreement for project-based work',
      type: 'freelance',
      icon: Briefcase
    },
    {
      id: 'consulting',
      name: 'Consulting Agreement',
      description: 'Professional consulting contract with hourly or project rates',
      type: 'consulting',
      icon: Lightbulb
    },
    {
      id: 'partnership',
      name: 'Partnership Agreement',
      description: 'Business partnership contract with profit sharing terms',
      type: 'partnership',
      icon: Users
    },
    {
      id: 'service',
      name: 'Service Agreement',
      description: 'General service contract for ongoing work relationships',
      type: 'service',
      icon: FileSignature
    },
    {
      id: 'rental',
      name: 'Rental Agreement',
      description: 'Property rental contract with terms and conditions',
      type: 'rental',
      icon: Home
    }
  ]

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setFormData({ ...formData, type: template.type, title: template.name })
    setStep('details')
  }

  const handleGenerateWithAI = async () => {
    setLoading(true)
    try {
      // TODO: Call AI service to generate contract content
      // const response = await aiApi.generateContract({
      //   type: formData.type,
      //   parties: formData.parties,
      //   terms: formData.terms
      // })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const generatedContent = getTemplateContent()
      setFormData({ ...formData, content: generatedContent })
      setStep('content')
    } catch (error) {
      console.error('Error generating contract:', error)
      alert('Failed to generate contract')
    } finally {
      setLoading(false)
    }
  }

  const getTemplateContent = () => {
    const { title, parties, terms } = formData
    
    return `# ${title}

## Agreement Date: ${new Date().toLocaleDateString()}

## Parties

**Client:**
Name: ${parties[0].name || '[Client Name]'}
Email: ${parties[0].email || '[Client Email]'}

**Contractor:**
Name: ${parties[1].name || '[Contractor Name]'}
Email: ${parties[1].email || '[Contractor Email]'}

## Terms and Conditions

### 1. Scope of Work
The Contractor agrees to provide the following services:
${terms.deliverables.filter(d => d).map((d, i) => `${i + 1}. ${d}`).join('\n') || '- [Service description]'}

### 2. Timeline
- Start Date: ${terms.startDate || '[Start Date]'}
- End Date: ${terms.endDate || '[End Date]'}

### 3. Payment Terms
- Total Payment: ${terms.payment || '[Amount]'}
- Payment Schedule: [Define payment schedule]

### 4. Deliverables
The Contractor will deliver:
${terms.deliverables.filter(d => d).map((d, i) => `- ${d}`).join('\n') || '- [List deliverables]'}

### 5. Confidentiality
Both parties agree to maintain confidentiality of all proprietary information.

### 6. Termination
Either party may terminate this agreement with [X] days written notice.

### 7. Governing Law
This agreement shall be governed by the laws of [Jurisdiction].

## Signatures

**Client Signature:**
_________________________
Date: _____________

**Contractor Signature:**
_________________________
Date: _____________

---

*Note: This is an AI-generated contract template. Please review and customize as needed. Consider having it reviewed by a legal professional.*`
  }

  const handleSave = async (status: 'draft' | 'sent') => {
    setLoading(true)
    try {
      // TODO: Save contract to backend
      // await contractsApi.create({ ...formData, status })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/dashboard/contracts')
    } catch (error) {
      console.error('Error saving contract:', error)
      alert('Failed to save contract')
    } finally {
      setLoading(false)
    }
  }

  const addParty = () => {
    setFormData({
      ...formData,
      parties: [...formData.parties, { name: '', role: '', email: '' }]
    })
  }

  const updateParty = (index: number, field: keyof Party, value: string) => {
    const newParties = [...formData.parties]
    newParties[index] = { ...newParties[index], [field]: value }
    setFormData({ ...formData, parties: newParties })
  }

  const addDeliverable = () => {
    setFormData({
      ...formData,
      terms: {
        ...formData.terms,
        deliverables: [...formData.terms.deliverables, '']
      }
    })
  }

  const updateDeliverable = (index: number, value: string) => {
    const newDeliverables = [...formData.terms.deliverables]
    newDeliverables[index] = value
    setFormData({
      ...formData,
      terms: { ...formData.terms, deliverables: newDeliverables }
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/contracts"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Contracts
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Contract</h1>
        <p className="text-gray-600 mt-2">
          {step === 'template' && 'Choose a template to get started'}
          {step === 'details' && 'Fill in the contract details'}
          {step === 'content' && 'Review and customize your contract'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step === 'template' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'template' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Template</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${step === 'details' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Details</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${step === 'content' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'content' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Content</span>
          </div>
        </div>
      </div>

      {/* Step 1: Template Selection */}
      {step === 'template' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const Icon = template.icon
            return (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                </div>
                <p className="text-gray-600">{template.description}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Step 2: Details Form */}
      {step === 'details' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 space-y-6">
            {/* Contract Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Website Development Contract"
              />
            </div>

            {/* Parties */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Parties Involved</h3>
                <button
                  onClick={addParty}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  + Add Party
                </button>
              </div>
              
              {formData.parties.map((party, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={party.name}
                      onChange={(e) => updateParty(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <input
                      type="text"
                      value={party.role}
                      onChange={(e) => updateParty(index, 'role', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Client, Contractor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={party.email}
                      onChange={(e) => updateParty(index, 'email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.terms.startDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    terms: { ...formData.terms, startDate: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.terms.endDate}
                  onChange={(e) => setFormData({
                    ...formData,
                    terms: { ...formData.terms, endDate: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
              <input
                type="text"
                value={formData.terms.payment}
                onChange={(e) => setFormData({
                  ...formData,
                  terms: { ...formData.terms, payment: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., $5,000"
              />
            </div>

            {/* Deliverables */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Deliverables</label>
                <button
                  onClick={addDeliverable}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  + Add Deliverable
                </button>
              </div>
              {formData.terms.deliverables.map((deliverable, index) => (
                <input
                  key={index}
                  type="text"
                  value={deliverable}
                  onChange={(e) => updateDeliverable(index, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-2"
                  placeholder="e.g., Website design mockups"
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={() => setStep('template')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleGenerateWithAI}
                disabled={loading || !formData.title}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{loading ? 'Generating...' : 'Generate Contract with AI'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Content Editor */}
      {step === 'content' && (
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Content</h3>
              <p className="text-sm text-gray-600">Review and edit your contract. You can customize any section.</p>
            </div>

            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={25}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setStep('details')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Saving...' : 'Save as Draft'}</span>
              </button>
              <button
                onClick={() => handleSave('sent')}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Sending...' : 'Save & Send'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
