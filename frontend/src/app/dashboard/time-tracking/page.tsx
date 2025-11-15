'use client'

import { Clock, Play, Pause } from 'lucide-react'
import { useState } from 'react'

export default function TimeTrackingPage() {
  const [isTracking, setIsTracking] = useState(false)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
        <p className="text-gray-600 mt-2">Track your work hours and generate bills</p>
      </div>

      {/* Timer Card */}
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-900 mb-6">00:00:00</div>
          <button
            onClick={() => setIsTracking(!isTracking)}
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
        <div className="text-center py-8">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No time entries yet</p>
        </div>
      </div>
    </div>
  )
}
