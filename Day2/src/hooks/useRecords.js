import { useState, useCallback, useMemo } from 'react'

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

export default function useRecords() {
  const [records, setRecords] = useState(initialRecords)

  const addRecord = useCallback((newRecord) => {
    const id = `REC-${String(records.length + 1).padStart(3, '0')}`
    setRecords(prev => [...prev, { ...newRecord, id }])
    return id
  }, [records.length])

  const updateRecord = useCallback((recordId, updates) => {
    setRecords(prev =>
      prev.map(r => r.id === recordId ? { ...r, ...updates } : r)
    )
  }, [])

  const deleteRecord = useCallback((recordId) => {
    setRecords(prev => prev.filter(r => r.id !== recordId))
  }, [])

  const getRecord = useCallback((recordId) => {
    return records.find(r => r.id === recordId)
  }, [records])

  const getStats = useCallback(() => {
    return {
      total: records.length,
      compliant: records.filter(r => r.status === 'compliant').length,
      warning: records.filter(r => r.status === 'warning').length,
      avgCompliance: Math.round(
        records.reduce((sum, r) => sum + r.percentage, 0) / records.length
      ),
      totalIssues: records.reduce((sum, r) => sum + r.issues, 0)
    }
  }, [records])

  const resetToDefaults = useCallback(() => {
    setRecords(initialRecords)
  }, [])

  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecord,
    getStats,
    resetToDefaults
  }
}
