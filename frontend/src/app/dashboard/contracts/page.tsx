'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileSignature, Plus, Search, Filter, Eye, Edit, Copy, Trash2, Download } from 'lucide-react'

interface Contract {
  id: string
  title: string
  type: string
  status: 'draft' | 'sent' | 'signed' | 'active' | 'completed'
  createdAt: string
  updatedAt: string
  parties?: Array<{ name: string; role: string }>
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [stats, setStats] = useState({
    total_contracts: 0,
    draft_count: 0,
    active_count: 0,
    signed_count: 0,
    completed_count: 0
  })

  useEffect(() => {
    fetchContracts()
    fetchStats()
  }, [statusFilter, typeFilter])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await contractsApi.getAll({ status: statusFilter, type: typeFilter })
      // setContracts(response.data)
      
      // Mock data
      const mockContracts: Contract[] = [
        {
          id: '1',
          title: 'Website Development Contract',
          type: 'freelance',
          status: 'active',
          createdAt: '2024-11-01',
          updatedAt: '2024-11-01',
          parties: [
            { name: 'Acme Corp', role: 'Client' },
            { name: 'John Doe', role: 'Contractor' }
          ]
        },
        {
          id: '2',
          title: 'Consulting Agreement - Tech Solutions',
          type: 'consulting',
          status: 'signed',
          createdAt: '2024-10-15',
          updatedAt: '2024-10-20',
          parties: [
            { name: 'Tech Solutions Inc', role: 'Client' }
          ]
        },
        {
          id: '3',
          title: 'Partnership Agreement',
          type: 'partnership',
          status: 'draft',
          createdAt: '2024-11-10',
          updatedAt: '2024-11-12'
        }
      ]
      setContracts(mockContracts)
    } catch (error) {
      console.error('Error fetching contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // TODO: Replace with actual API call
      setStats({
        total_contracts: 12,
        draft_count: 3,
        active_count: 5,
        signed_count: 2,
        completed_count: 2
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'sent':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      freelance: 'Freelance',
      employment: 'Employment',
      partnership: 'Partnership',
      service: 'Service',
      consulting: 'Consulting',
      rental: 'Rental'
    }
    return labels[type] || type
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
    const matchesType = typeFilter === 'all' || contract.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts & Proposals</h1>
          <p className="text-gray-600 mt-2">Create and manage professional contracts</p>
        </div>
        <Link 
          href="/dashboard/contracts/new"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Contract</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_contracts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileSignature className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{stats.draft_count}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.active_count}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Signed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.signed_count}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.completed_count}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="freelance">Freelance</option>
              <option value="employment">Employment</option>
              <option value="partnership">Partnership</option>
              <option value="service">Service</option>
              <option value="consulting">Consulting</option>
              <option value="rental">Rental</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="signed">Signed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading contracts...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="p-8 text-center">
            <FileSignature className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first contract to get started'}
            </p>
            <Link 
              href="/dashboard/contracts/new"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              Create Contract
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredContracts.map((contract) => (
              <div key={contract.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {getTypeLabel(contract.type)}
                      </span>
                    </div>
                    
                    {contract.parties && contract.parties.length > 0 && (
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        {contract.parties.map((party, index) => (
                          <span key={index}>
                            <span className="font-medium">{party.name}</span>
                            {party.role && <span className="text-gray-400"> ({party.role})</span>}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {new Date(contract.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Updated: {new Date(contract.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100" title="View">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100" title="Edit">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100" title="Download">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100" title="Duplicate">
                      <Copy className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
