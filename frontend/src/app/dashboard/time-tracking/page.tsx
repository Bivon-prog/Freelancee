'use client'

import { useState, useEffect } from 'react'
import { Clock, Play, Pause, Plus, Edit, Trash2, DollarSign, Calendar, TrendingUp } from 'lucide-react'

interface TimeEntry {
  id: string
  description: string
  client_name?: string
  project_name?: string
  start_time: string
  end_time?: string
  duration: number
  hourly_rate?: number
  billable: boolean
}

interface TimerState {
  isRunning: boolean
  activeEntry: TimeEntry | null
  elapsedSeconds: number
}

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    activeEntry: null,
    elapsedSeconds: 0
  })
  const [stats, setStats] = useState({
    total_entries: 0,
    total_minutes: 0,
    billable_minutes: 0,
    total_earnings: 0,
    this_week_minutes: 0,
    this_month_minutes: 0
  })
  const [showNewEntryForm, setShowNewEntryForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    description: '',
    hourlyRate: 50
  })

  useEffect(() => {
    fetchEntries()
    fetchStats()
    checkActiveTimer()
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (timer.isRunning && timer.activeEntry) {
      interval = setInterval(() => {
        const startTime = new Date(timer.activeEntry!.start_time).getTime()
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000)
        setTimer(prev => ({ ...prev, elapsedSeconds: elapsed }))
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer.isRunning, timer.activeEntry])

  const checkActiveTimer = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await timeTrackingApi.getActiveTimer()
      // if (response.data) {
      //   setTimer({
      //     isRunning: true,
      //     activeEntry: response.data,
      //     elapsedSeconds: 0
      //   })
      // }
    } catch (error) {
      console.error('Error checking active timer:', error)
    }
  }

  const fetchEntries = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const response = await timeTrackingApi.getEntries()
      // setEntries(response.data)
      
      // Mock data
      const mockEntries: TimeEntry[] = [
        {
          id: '1',
          description: 'Website development',
          client_name: 'Acme Corp',
          project_name: 'Website Redesign',
          start_time: '2024-11-15T09:00:00',
          end_time: '2024-11-15T12:30:00',
          duration: 210,
          hourly_rate: 50,
          billable: true
        },
        {
          id: '2',
          description: 'Client meeting',
          client_name: 'Tech Solutions',
          start_time: '2024-11-15T14:00:00',
          end_time: '2024-11-15T15:00:00',
          duration: 60,
          hourly_rate: 50,
          billable: true
        }
      ]
      setEntries(mockEntries)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // TODO: Replace with actual API call
      setStats({
        total_entries: 45,
        total_minutes: 2850,
        billable_minutes: 2640,
        total_earnings: 2200,
        this_week_minutes: 1200,
        this_month_minutes: 2850
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const startTimer = async () => {
    try {
      if (!newEntry.description) {
        alert('Please enter a description')
        return
      }

      // TODO: Replace with actual API call
      // const response = await timeTrackingApi.startTimer(newEntry)
      // setTimer({
      //   isRunning: true,
      //   activeEntry: response.data,
      //   elapsedSeconds: 0
      // })
      
      // Mock
      const mockEntry: TimeEntry = {
        id: Date.now().toString(),
        description: newEntry.description,
        start_time: new Date().toISOString(),
        duration: 0,
        hourly_rate: newEntry.hourlyRate,
        billable: true
      }
      
      setTimer({
        isRunning: true,
        activeEntry: mockEntry,
        elapsedSeconds: 0
      })
      
      setShowNewEntryForm(false)
      setNewEntry({ description: '', hourlyRate: 50 })
    } catch (error) {
      console.error('Error starting timer:', error)
      alert('Failed to start timer')
    }
  }

  const stopTimer = async () => {
    try {
      if (!timer.activeEntry) return

      // TODO: Replace with actual API call
      // await timeTrackingApi.stopTimer(timer.activeEntry.id)
      
      setTimer({
        isRunning: false,
        activeEntry: null,
        elapsedSeconds: 0
      })
      
      fetchEntries()
      fetchStats()
    } catch (error) {
      console.error('Error stopping timer:', error)
      alert('Failed to stop timer')
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const calculateEarnings = (entry: TimeEntry) => {
    if (!entry.hourly_rate || !entry.billable) return 0
    return (entry.duration / 60) * entry.hourly_rate
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
        <p className="text-gray-600 mt-2">Track your work hours and generate bills</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatDuration(stats.this_week_minutes)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatDuration(stats.this_month_minutes)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${stats.total_earnings.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_entries}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Timer Card */}
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="text-center">
          {timer.isRunning ? (
            <>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Timer Running
                </span>
              </div>
              <div className="text-6xl font-bold text-gray-900 mb-2">
                {formatTime(timer.elapsedSeconds)}
              </div>
              <p className="text-gray-600 mb-6">{timer.activeEntry?.description}</p>
              <button
                onClick={stopTimer}
                className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 flex items-center space-x-2 mx-auto"
              >
                <Pause className="w-5 h-5" />
                <span>Stop Timer</span>
              </button>
            </>
          ) : showNewEntryForm ? (
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Start New Timer</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    What are you working on?
                  </label>
                  <input
                    type="text"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="e.g., Website development"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    value={newEntry.hourlyRate}
                    onChange={(e) => setNewEntry({ ...newEntry, hourlyRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={startTimer}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Timer</span>
                  </button>
                  <button
                    onClick={() => setShowNewEntryForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-6xl font-bold text-gray-400 mb-6">00:00:00</div>
              <button
                onClick={() => setShowNewEntryForm(true)}
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                <span>Start Timer</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Time Entries List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Entries</h2>
            <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
              <Plus className="w-5 h-5" />
              <span>Add Manual Entry</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No time entries yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your time to see entries here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{entry.description}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      {entry.client_name && (
                        <span className="flex items-center">
                          <span className="font-medium">{entry.client_name}</span>
                        </span>
                      )}
                      {entry.project_name && (
                        <span>• {entry.project_name}</span>
                      )}
                      <span>• {new Date(entry.start_time).toLocaleDateString()}</span>
                      <span>• {new Date(entry.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatDuration(entry.duration)}
                      </div>
                      {entry.billable && entry.hourly_rate && (
                        <div className="text-sm text-green-600 font-medium">
                          ${calculateEarnings(entry).toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-primary-600" title="Edit">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600" title="Delete">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
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
