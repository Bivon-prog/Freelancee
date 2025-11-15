'use client'

import { useState } from 'react'
import { Sparkles, FileText, Mail, MessageSquare, BookOpen, Package, Copy, Download, RotateCcw, Check } from 'lucide-react'

type ContentType = 'blog' | 'email' | 'social' | 'essay' | 'product' | 'general'
type Tone = 'professional' | 'casual' | 'formal' | 'friendly'
type Mode = 'generate' | 'rewrite' | 'grammar' | 'summarize'

export default function WritingPage() {
  const [mode, setMode] = useState<Mode>('generate')
  const [contentType, setContentType] = useState<ContentType>('blog')
  const [tone, setTone] = useState<Tone>('professional')
  const [prompt, setPrompt] = useState('')
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const contentTypes = [
    { value: 'blog', label: 'Blog Post', icon: FileText, description: 'Professional blog articles' },
    { value: 'email', label: 'Email', icon: Mail, description: 'Business emails' },
    { value: 'social', label: 'Social Media', icon: MessageSquare, description: 'Engaging posts' },
    { value: 'essay', label: 'Essay', icon: BookOpen, description: 'Academic writing' },
    { value: 'product', label: 'Product Description', icon: Package, description: 'Marketing copy' },
  ]

  const tones = [
    { value: 'professional', label: 'Professional', emoji: '💼' },
    { value: 'casual', label: 'Casual', emoji: '😊' },
    { value: 'formal', label: 'Formal', emoji: '🎩' },
    { value: 'friendly', label: 'Friendly', emoji: '👋' },
  ]

  const modes = [
    { value: 'generate', label: 'Generate Content', icon: Sparkles },
    { value: 'rewrite', label: 'Rewrite Text', icon: RotateCcw },
    { value: 'grammar', label: 'Check Grammar', icon: Check },
    { value: 'summarize', label: 'Summarize', icon: FileText },
  ]

  const handleGenerate = async () => {
    if (!prompt && mode === 'generate') {
      alert('Please enter a prompt')
      return
    }
    
    if (!inputText && mode !== 'generate') {
      alert('Please enter text')
      return
    }

    setLoading(true)
    setOutputText('')

    try {
      // TODO: Replace with actual API call
      // const response = await aiApi.generateContent({ prompt, type: contentType, tone })
      // setOutputText(response.data.content)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock responses based on mode
      if (mode === 'generate') {
        setOutputText(getMockGeneratedContent())
      } else if (mode === 'rewrite') {
        setOutputText(getMockRewrittenContent())
      } else if (mode === 'grammar') {
        setOutputText(getMockGrammarCheck())
      } else if (mode === 'summarize') {
        setOutputText(getMockSummary())
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to process request')
    } finally {
      setLoading(false)
    }
  }

  const getMockGeneratedContent = () => {
    const templates: Record<ContentType, string> = {
      blog: `# ${prompt}

## Introduction
This is a professionally generated blog post about ${prompt}. In today's digital landscape, understanding this topic is crucial for success.

## Key Points
1. **First Point**: Important consideration about ${prompt}
2. **Second Point**: Another crucial aspect to consider  
3. **Third Point**: Final thoughts on the matter

## Conclusion
In conclusion, ${prompt} represents an important topic that deserves attention.

*Note: This is mock content. Connect OpenAI API for real generation.*`,
      
      email: `Subject: Regarding ${prompt}

Dear [Recipient],

I hope this email finds you well. I'm writing to discuss ${prompt}.

After careful consideration, I believe this matter requires our attention.

Best regards,
[Your Name]

*Note: Connect OpenAI API for real email generation.*`,
      
      social: `🚀 Exciting news about ${prompt}! 

Did you know that ${prompt} can transform the way you work?

✨ Benefit #1
💡 Benefit #2
🎯 Benefit #3

#productivity #innovation

*Note: Connect OpenAI API for real content.*`,
      
      essay: `${prompt}

Introduction:
This essay explores the important topic of ${prompt}...

Body:
[Main arguments and analysis]

Conclusion:
In summary, ${prompt} demonstrates...

*Note: Connect OpenAI API for real essay generation.*`,
      
      product: `${prompt}

Key Features:
• Feature 1
• Feature 2
• Feature 3

Benefits:
Transform your workflow with this amazing product.

*Note: Connect OpenAI API for real product descriptions.*`,
      
      general: `Content about: ${prompt}\n\n*Note: Connect OpenAI API for real generation.*`
    }
    
    return templates[contentType] || templates.general
  }

  const getMockRewrittenContent = () => {
    return `[Rewritten in ${tone} tone]\n\n${inputText}\n\n*Note: This is mock content. Connect OpenAI API for real rewriting.*`
  }

  const getMockGrammarCheck = () => {
    return `✅ Grammar Check Results:\n\nOriginal text looks good!\n\nSuggestions:\n• Consider using more active voice\n• This sentence could be more concise\n\n*Note: Connect OpenAI API for real grammar checking.*`
  }

  const getMockSummary = () => {
    const wordCount = inputText.split(' ').length
    return `📝 Summary (${wordCount} words → ${Math.floor(wordCount / 3)} words):\n\nThis is a concise summary of your text.\n\n*Note: Connect OpenAI API for real summarization.*`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadAsText = () => {
    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${mode}-${Date.now()}.txt`
    a.click()
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Writing Assistant</h1>
        <p className="text-gray-600 mt-2">Generate content, check grammar, and improve your writing with AI</p>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Mode</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {modes.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.value}
                onClick={() => setMode(m.value as Mode)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  mode === m.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${mode === m.value ? 'text-primary-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-gray-900">{m.label}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {mode === 'generate' && (
            <>
              {/* Content Type Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Type</h2>
                <div className="grid grid-cols-2 gap-3">
                  {contentTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        onClick={() => setContentType(type.value as ContentType)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          contentType === type.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${contentType === type.value ? 'text-primary-600' : 'text-gray-400'}`} />
                        <div className="text-sm font-medium text-gray-900">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tone Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tone</h2>
                <div className="grid grid-cols-2 gap-3">
                  {tones.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value as Tone)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        tone === t.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <div className="text-sm font-medium text-gray-900">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">What do you want to write about?</h2>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., The benefits of remote work for productivity"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading || !prompt}
                  className="mt-4 w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{loading ? 'Generating...' : 'Generate Content'}</span>
                </button>
              </div>
            </>
          )}

          {mode !== 'generate' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {mode === 'rewrite' && 'Text to Rewrite'}
                {mode === 'grammar' && 'Text to Check'}
                {mode === 'summarize' && 'Text to Summarize'}
              </h2>
              
              {mode === 'rewrite' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {tones.map((t) => (
                      <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !inputText}
                className="mt-4 w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {loading ? 'Processing...' : 
                   mode === 'rewrite' ? 'Rewrite Text' :
                   mode === 'grammar' ? 'Check Grammar' :
                   'Summarize'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Result</h2>
            {outputText && (
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                  title="Copy to clipboard"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={downloadAsText}
                  className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                  title="Download as text"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">AI is working its magic...</p>
            </div>
          ) : outputText ? (
            <>
              {copied && (
                <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg text-sm">
                  ✓ Copied to clipboard!
                </div>
              )}
              <div className="prose max-w-none">
                <textarea
                  value={outputText}
                  onChange={(e) => setOutputText(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Sparkles className="w-16 h-16 mb-4" />
              <p>Your AI-generated content will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
