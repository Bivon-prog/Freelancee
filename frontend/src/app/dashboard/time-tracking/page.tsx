'use client'

import { Clock, Play, Pause, Plus, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { timeTrackingApi, clientsApi } from '@/lib/api'

export default function TimeTrackingPage() {
  const [isTracking, setIsTracking] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [entries, setEntries] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [currentEntry, setCurrentEntry] = useState({
    description: '',
    clientId: '',
    hourlyRate: 0
  })

  useEffect(() => {
    fetchEntries()
    fetchClients()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTracking) {
      interval = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTracking])

  const fetchEntries = async () => {
    try {
      const response = await timeTrackingApi.getEntries()
      setEntries(response.data)
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await clientsApi.getAll()
      setClients(response.data)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleStartStop = () => {
    if (isTracking) {
      // Stop timer and show modal to save entry
      setShowModal(true)
    } else {
      // Start timer
      setIsTracking(true)
      setSeconds(0)
    }
  }

  const handleSaveEntry = async () => {
    try {
      const startTime = new Date(Date.now() - seconds * 1000).toISOString()
      const endTime = new Date().toISOString()
      
      await timeTrackingApi.createEntry({
        ...currentEntry,
        startTime,
        endTime
      })
      
      setIsTracking(false)
      setSeconds(0)
      setShowModal(false)
      setCurrentEntry({ description: '', clientId: '', hourlyRate: 0 })
      fetchEntries()
    } catch (error) {
      console.error('Failed to save entry:', error)
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      await timeTrackingApi.deleteEntry(id)
      fetchEntries()
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  const getTotalHours = () => {
    return entries.reduce((total, entry) => total + (entry.duration / 60), 0).toFixed(2)
  }

  const getTotalEarnings = () => {
    return entries.reduce((total, entry) => {
      const hours = entry.duration / 60
      return total + (hours * (entry.hourly_rate || 0))
    }, 0).toFixed(2)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
        <p className="text-gray-600 mt-2">Track your work hours and generate bills</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Hours This Month</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{getTotalHours()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">${getTotalEarnings()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Entries</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{entries.length}</p>
        </div>
      </div>

      {/* Timer Card */}
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-900 mb-6">{formatTime(seconds)}</div>
          <button
            onClick={handleStartStop}
            className={`${
              isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            } text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-2 mx-auto`}
          >
            {isTracking ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Stop Timer</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Timer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Entries</h2>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No time entries yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{entry.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(entry.start_time).toLocaleDateString()} • {(entry.duration / 60).toFixed(2)} hours
                    {entry.hourly_rate && ` • $${((entry.duration / 60) * entry.hourly_rate).toFixed(2)}`}
                  </p>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Save Time Entry</h2>
            <p className="text-gray-600 mb-4">Time tracked: {formatTime(seconds)}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={currentEntry.description}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="What did you work on?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client (Optional)</label>
                <select
                  value={currentEntry.clientId}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate (Optional)</label>
                <input
                  type="number"
                  value={currentEntry.hourlyRate}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, hourlyRate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowModal(false)
                  setIsTracking(false)
                  setSeconds(0)
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                onClick={handleSaveEntry}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
