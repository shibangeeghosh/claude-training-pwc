import React, { useState } from 'react'
import { CheckCircle2, AlertCircle, XCircle, Plus, Edit2, Trash2 } from 'lucide-react'

const PRINCIPLES = [
  {
    id: 'attributable',
    name: 'Attributable',
    description: 'All data must be traceable to its source with clear user identification'
  },
  {
    id: 'legible',
    name: 'Legible',
    description: 'Data must be clear, readable, and recorded contemporaneously in permanent ink'
  },
  {
    id: 'contemporaneous',
    name: 'Contemporaneous',
    description: 'Data must be recorded at the time of the event or activity'
  },
  {
    id: 'original',
    name: 'Original',
    description: 'Original data must be retained, with copies maintained for reference only'
  },
  {
    id: 'accurate',
    name: 'Accurate',
    description: 'All data must be accurate, precise, and consistent with source information'
  },
  {
    id: 'complete',
    name: 'Complete',
    description: 'All required data fields must be completed; missing data requires justification'
  },
  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Data should be consistent throughout all related records and systems'
  },
  {
    id: 'enduring',
    name: 'Enduring',
    description: 'Records must be maintained in a durable format with proper archival'
  }
]

const initialChecks = {
  attributable: { status: 'pass', percentage: 95, issues: 2 },
  legible: { status: 'pass', percentage: 92, issues: 4 },
  contemporaneous: { status: 'warning', percentage: 88, issues: 6 },
  original: { status: 'pass', percentage: 97, issues: 1 },
  accurate: { status: 'pass', percentage: 90, issues: 3 },
  complete: { status: 'warning', percentage: 85, issues: 8 },
  consistent: { status: 'pass', percentage: 93, issues: 2 },
  enduring: { status: 'pass', percentage: 87, issues: 5 }
}

export default function ComplianceTracker() {
  const [checks, setChecks] = useState(initialChecks)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pass':
        return 'compliance-pass'
      case 'warning':
        return 'compliance-warning'
      case 'fail':
        return 'compliance-fail'
      default:
        return ''
    }
  }

  const toggleStatus = (principleId) => {
    setChecks(prev => ({
      ...prev,
      [principleId]: {
        ...prev[principleId],
        status: prev[principleId].status === 'pass' ? 'warning' : 'pass'
      }
    }))
    setEditingId(null)
  }

  /**
   * Handles creation of a new compliance check
   * Shows a confirmation dialog and simulates async operation
   */
  const handleNewCheck = async () => {
    try {
      setLoading('new-check')
      setError(null)

      const confirmed = window.confirm(
        'Create a new compliance audit check? This will create a snapshot of all ALCOA+ principles.'
      )

      if (!confirmed) {
        setLoading(null)
        return
      }

      // Simulate async operation (API call in real app)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Reset all checks to default/pass state
      setChecks(initialChecks)
      setEditingId(null)

      // Show success message
      console.log('New compliance check created successfully')
    } catch (err) {
      setError('Failed to create new compliance check')
      console.error('Error creating check:', err)
    } finally {
      setLoading(null)
    }
  }

  /**
   * Handles deletion of a compliance check
   * Shows confirmation dialog and removes the check
   */
  const handleDeleteCheck = async (principleId) => {
    try {
      setLoading(`delete-${principleId}`)
      setError(null)

      const principle = PRINCIPLES.find(p => p.id === principleId)
      const confirmed = window.confirm(
        `Are you sure you want to delete the compliance check for "${principle.name}"? This action cannot be undone.`
      )

      if (!confirmed) {
        setLoading(null)
        return
      }

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 300))

      // Reset this principle check to defaults
      setChecks(prev => ({
        ...prev,
        [principleId]: initialChecks[principleId]
      }))

      setEditingId(null)
      console.log(`Compliance check deleted for principle: ${principleId}`)
    } catch (err) {
      setError(`Failed to delete compliance check`)
      console.error('Error deleting check:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ALCOA+ Compliance Tracker</h1>
        <button
          onClick={handleNewCheck}
          disabled={loading !== null}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'new-check' ? (
            <>
              <div className="animate-spin">⏳</div>
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              New Check
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {PRINCIPLES.map(principle => {
          const check = checks[principle.id]
          return (
            <div key={principle.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(check.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{principle.name}</h3>
                    <span className={`compliance-badge ${getStatusBadge(check.status)}`}>
                      {check.status === 'pass' ? 'Compliant' : check.status === 'warning' ? 'Warning' : 'Non-Compliant'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{principle.description}</p>

                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-2xl font-bold text-eli-blue">{check.percentage}%</div>
                      <p className="text-xs text-gray-500">Compliance Score</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{check.issues}</div>
                      <p className="text-xs text-gray-500">Outstanding Issues</p>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            check.status === 'pass'
                              ? 'bg-green-500'
                              : check.status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${check.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStatus(principle.id)}
                    disabled={loading !== null}
                    className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Toggle compliance status"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteCheck(principle.id)}
                    disabled={loading !== null}
                    className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete compliance check"
                  >
                    {loading === `delete-${principle.id}` ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-600" />
                    )}
                  </button>
                </div>
              </div>

              {editingId === principle.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setChecks(prev => ({
                          ...prev,
                          [principle.id]: { ...prev[principle.id], status: 'pass' }
                        }))
                        setEditingId(null)
                      }}
                      className="btn-primary text-sm"
                    >
                      Mark Compliant
                    </button>
                    <button
                      onClick={() => {
                        setChecks(prev => ({
                          ...prev,
                          [principle.id]: { ...prev[principle.id], status: 'warning' }
                        }))
                        setEditingId(null)
                      }}
                      className="btn-secondary text-sm"
                    >
                      Mark Warning
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
