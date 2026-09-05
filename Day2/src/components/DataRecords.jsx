import React, { useState } from 'react'
import { Search, Filter, Plus, Eye, Edit2, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react'

const initialRecords = [
  {
    id: 'REC-001',
    title: 'Clinical Trial Data Entry',
    principle: 'Attributable, Accurate',
    status: 'compliant',
    author: 'Dr. Sarah Johnson',
    date: '2024-12-15',
    issues: 0,
    percentage: 100
  },
  {
    id: 'REC-002',
    title: 'Lab Batch Record',
    principle: 'Legible, Original',
    status: 'compliant',
    author: 'James Chen',
    date: '2024-12-14',
    issues: 0,
    percentage: 98
  },
  {
    id: 'REC-003',
    title: 'Equipment Maintenance Log',
    principle: 'Contemporaneous',
    status: 'warning',
    author: 'Maria Rodriguez',
    date: '2024-12-13',
    issues: 2,
    percentage: 85
  },
  {
    id: 'REC-004',
    title: 'QC Analysis Report',
    principle: 'Consistent, Enduring',
    status: 'compliant',
    author: 'Dr. Michael Park',
    date: '2024-12-12',
    issues: 0,
    percentage: 97
  },
  {
    id: 'REC-005',
    title: 'Deviation Report',
    principle: 'Accurate, Complete',
    status: 'warning',
    author: 'Emma Williams',
    date: '2024-12-11',
    issues: 3,
    percentage: 82
  },
  {
    id: 'REC-006',
    title: 'Stability Data',
    principle: 'All Principles',
    status: 'compliant',
    author: 'Dr. Rajesh Patel',
    date: '2024-12-10',
    issues: 0,
    percentage: 99
  }
]

export default function DataRecords() {
  const [records, setRecords] = useState(initialRecords)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)
  const [viewingRecord, setViewingRecord] = useState(null)
  const [editingRecord, setEditingRecord] = useState(null)

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus
    return matchesSearch && matchesFilter
  })

  /**
   * Handles creation of a new data record
   * Shows a confirmation and creates a new record with default values
   */
  const handleNewRecord = async () => {
    try {
      setLoading('new-record')
      setError(null)

      const confirmed = window.confirm(
        'Create a new data record? You will be able to edit the details.'
      )

      if (!confirmed) {
        setLoading(null)
        return
      }

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create new record with default values
      const newId = `REC-${String(records.length + 1).padStart(3, '0')}`
      const newRecord = {
        id: newId,
        title: 'New Record',
        principle: 'Select Principles',
        status: 'compliant',
        author: 'Current User',
        date: new Date().toISOString().split('T')[0],
        issues: 0,
        percentage: 100
      }

      setRecords(prev => [...prev, newRecord])
      setEditingRecord(newRecord)
      console.log('New record created:', newId)
    } catch (err) {
      setError('Failed to create new record')
      console.error('Error creating record:', err)
    } finally {
      setLoading(null)
    }
  }

  /**
   * Handles viewing a record's full details
   * Opens a modal with complete record information
   */
  const handleViewRecord = async (record) => {
    try {
      setLoading(`view-${record.id}`)
      setError(null)

      // Simulate async operation (API call to fetch full details)
      await new Promise(resolve => setTimeout(resolve, 300))

      setViewingRecord(record)
      console.log('Viewing record:', record.id)
    } catch (err) {
      setError('Failed to load record details')
      console.error('Error viewing record:', err)
    } finally {
      setLoading(null)
    }
  }

  /**
   * Handles editing a record
   * Opens edit mode for the selected record
   */
  const handleEditRecord = async (record) => {
    try {
      setLoading(`edit-${record.id}`)
      setError(null)

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 300))

      setEditingRecord({ ...record })
      console.log('Editing record:', record.id)
    } catch (err) {
      setError('Failed to open record for editing')
      console.error('Error editing record:', err)
    } finally {
      setLoading(null)
    }
  }

  /**
   * Handles saving an edited record
   * Updates the record in the list
   */
  const handleSaveRecord = async (updatedRecord) => {
    try {
      setLoading(`save-${updatedRecord.id}`)
      setError(null)

      // Simulate async operation (API call to save)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update record in list
      setRecords(prev =>
        prev.map(r => r.id === updatedRecord.id ? updatedRecord : r)
      )

      setEditingRecord(null)
      console.log('Record saved:', updatedRecord.id)
    } catch (err) {
      setError('Failed to save record')
      console.error('Error saving record:', err)
    } finally {
      setLoading(null)
    }
  }

  /**
   * Handles deletion of a record
   * Shows confirmation dialog and removes the record
   */
  const handleDeleteRecord = async (record) => {
    try {
      setLoading(`delete-${record.id}`)
      setError(null)

      const confirmed = window.confirm(
        `Are you sure you want to delete record "${record.title}" (${record.id})? This action cannot be undone.`
      )

      if (!confirmed) {
        setLoading(null)
        return
      }

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 300))

      // Remove record from list
      setRecords(prev => prev.filter(r => r.id !== record.id))
      setViewingRecord(null)
      console.log('Record deleted:', record.id)
    } catch (err) {
      setError('Failed to delete record')
      console.error('Error deleting record:', err)
    } finally {
      setLoading(null)
    }
  }

  const getStatusColor = (status) => {
    return status === 'compliant' ? 'text-green-600' : 'text-yellow-600'
  }

  const getStatusBg = (status) => {
    return status === 'compliant' ? 'bg-green-50' : 'bg-yellow-50'
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Data Records</h1>
        <button
          onClick={handleNewRecord}
          disabled={loading !== null}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'new-record' ? (
            <>
              <div className="animate-spin">⏳</div>
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              New Record
            </>
          )}
        </button>
      </div>

      <div className="card p-4">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Record ID or Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eli-blue focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eli-blue focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="compliant">Compliant</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-600">No records found matching your criteria</p>
          </div>
        ) : (
          filteredRecords.map(record => (
            <div key={record.id} className={`card p-4 hover:shadow-md transition-shadow ${getStatusBg(record.status)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {record.status === 'compliant' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    <h3 className="font-semibold text-gray-900">{record.title}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded bg-white ${getStatusColor(record.status)}`}>
                      {record.id}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Principles</p>
                      <p className="text-sm text-gray-700">{record.principle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Author</p>
                      <p className="text-sm text-gray-700">{record.author}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm text-gray-700">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-semibold text-eli-blue">{record.percentage}%</span>
                      <span className="text-gray-500"> Compliant</span>
                    </div>
                    {record.issues > 0 && (
                      <div className="text-sm">
                        <span className="font-semibold text-red-600">{record.issues}</span>
                        <span className="text-gray-500"> Issues</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="w-full bg-gray-300 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-eli-blue to-eli-accent"
                          style={{ width: `${record.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewRecord(record)}
                    disabled={loading !== null}
                    className="p-2 hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="View record details"
                  >
                    {loading === `view-${record.id}` ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Eye className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEditRecord(record)}
                    disabled={loading !== null}
                    className="p-2 hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit record"
                  >
                    {loading === `edit-${record.id}` ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(record)}
                    disabled={loading !== null}
                    className="p-2 hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete record"
                  >
                    {loading === `delete-${record.id}` ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card p-4 bg-eli-light">
        <h3 className="font-semibold text-gray-900 mb-2">Compliance Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold text-eli-navy">{records.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Compliant</p>
            <p className="text-2xl font-bold text-green-600">{records.filter(r => r.status === 'compliant').length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Warnings</p>
            <p className="text-2xl font-bold text-yellow-600">{records.filter(r => r.status === 'warning').length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Compliance</p>
            <p className="text-2xl font-bold text-eli-blue">
              {Math.round(records.reduce((sum, r) => sum + r.percentage, 0) / records.length)}%
            </p>
          </div>
        </div>
      </div>

      {/* View Record Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Record Details</h2>
              <button
                onClick={() => setViewingRecord(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Record ID</p>
                  <p className="text-lg font-semibold text-gray-900">{viewingRecord.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className={`text-lg font-semibold ${getStatusColor(viewingRecord.status)}`}>
                    {viewingRecord.status === 'compliant' ? 'Compliant' : 'Warning'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">Title</p>
                <p className="text-lg font-semibold text-gray-900">{viewingRecord.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Author</p>
                  <p className="text-gray-700">{viewingRecord.author}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Date</p>
                  <p className="text-gray-700">{new Date(viewingRecord.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">Principles</p>
                <p className="text-gray-700">{viewingRecord.principle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Compliance Score</p>
                  <p className="text-2xl font-bold text-eli-blue">{viewingRecord.percentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Outstanding Issues</p>
                  <p className="text-2xl font-bold text-red-600">{viewingRecord.issues}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setViewingRecord(null)
                  handleEditRecord(viewingRecord)
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setViewingRecord(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Record</h2>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
                <input
                  type="text"
                  value={editingRecord.title}
                  onChange={(e) => setEditingRecord({ ...editingRecord, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eli-blue focus:border-transparent"
                  placeholder="Record title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Principles</label>
                <input
                  type="text"
                  value={editingRecord.principle}
                  onChange={(e) => setEditingRecord({ ...editingRecord, principle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eli-blue focus:border-transparent"
                  placeholder="ALCOA+ principles"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                  <select
                    value={editingRecord.status}
                    onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eli-blue focus:border-transparent"
                  >
                    <option value="compliant">Compliant</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Compliance %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingRecord.percentage}
                    onChange={(e) => setEditingRecord({ ...editingRecord, percentage: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eli-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Author</label>
                  <input
                    type="text"
                    value={editingRecord.author}
                    onChange={(e) => setEditingRecord({ ...editingRecord, author: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eli-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Issues</label>
                  <input
                    type="number"
                    min="0"
                    value={editingRecord.issues}
                    onChange={(e) => setEditingRecord({ ...editingRecord, issues: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eli-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Date</label>
                <input
                  type="date"
                  value={editingRecord.date}
                  onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eli-blue focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => handleSaveRecord(editingRecord)}
                disabled={loading !== null}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === `save-${editingRecord.id}` ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditingRecord(null)}
                disabled={loading !== null}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
