import React, { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ComplianceTracker from './components/ComplianceTracker'
import DataRecords from './components/DataRecords'
import ApifySearch from './components/ApifySearch'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-eli-blue text-eli-blue'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'tracker'
                ? 'border-eli-blue text-eli-blue'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Compliance Tracker
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'records'
                ? 'border-eli-blue text-eli-blue'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Data Records
          </button>
          <button
            onClick={() => setActiveTab('apify')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'apify'
                ? 'border-eli-blue text-eli-blue'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Apify Search
          </button>
        </div>

        <div>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'tracker' && <ComplianceTracker />}
          {activeTab === 'records' && <DataRecords />}
          {activeTab === 'apify' && <ApifySearch />}
        </div>
      </div>
    </div>
  )
}
