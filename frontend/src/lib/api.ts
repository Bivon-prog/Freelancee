import axios from 'axios'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const aiApi = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/api/auth/register', { name, email, password }),
}

// Clients API
export const clientsApi = {
  getAll: () => api.get('/api/clients'),
  create: (data: any) => api.post('/api/clients', data),
  update: (id: string, data: any) => api.put(`/api/clients/${id}`, data),
  delete: (id: string) => api.delete(`/api/clients/${id}`),
}

// Invoices API
export const invoicesApi = {
  getAll: () => api.get('/api/invoices'),
  create: (data: any) => api.post('/api/invoices', data),
  update: (id: string, data: any) => api.put(`/api/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/api/invoices/${id}`),
}

// Time Tracking API
export const timeTrackingApi = {
  getEntries: () => api.get('/api/time-tracking/entries'),
  createEntry: (data: any) => api.post('/api/time-tracking/entries', data),
  updateEntry: (id: string, data: any) => api.put(`/api/time-tracking/entries/${id}`, data),
  deleteEntry: (id: string) => api.delete(`/api/time-tracking/entries/${id}`),
}

// Contracts API
export const contractsApi = {
  getAll: () => api.get('/api/contracts'),
  create: (data: any) => api.post('/api/contracts', data),
  update: (id: string, data: any) => api.put(`/api/contracts/${id}`, data),
  delete: (id: string) => api.delete(`/api/contracts/${id}`),
}

// Resumes API
export const resumesApi = {
  getAll: () => api.get('/api/resumes'),
  create: (data: any) => api.post('/api/resumes', data),
  update: (id: string, data: any) => api.put(`/api/resumes/${id}`, data),
  delete: (id: string) => api.delete(`/api/resumes/${id}`),
}

// AI API
export const aiApiMethods = {
  generateContent: (data: any) => aiApi.post('/api/ai/generate-content', data),
  checkGrammar: (text: string) => aiApi.post('/api/ai/check-grammar', { text }),
  rewrite: (text: string, tone: string) => aiApi.post('/api/ai/rewrite', { text, tone }),
  summarize: (text: string, length?: string) => aiApi.post('/api/ai/summarize', { text, length }),
  optimizeResume: (resumeText: string, jobDescription: string) =>
    aiApi.post('/api/ai/optimize-resume', { resume_text: resumeText, job_description: jobDescription }),
  generateContract: (data: any) => aiApi.post('/api/ai/generate-contract', data),
}
