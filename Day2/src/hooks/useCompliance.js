import { useState, useCallback } from 'react'

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

export default function useCompliance() {
  const [checks, setChecks] = useState(initialChecks)

  const updateStatus = useCallback((principleId, newStatus) => {
    setChecks(prev => ({
      ...prev,
      [principleId]: {
        ...prev[principleId],
        status: newStatus
      }
    }))
  }, [])

  const updatePercentage = useCallback((principleId, percentage) => {
    setChecks(prev => ({
      ...prev,
      [principleId]: {
        ...prev[principleId],
        percentage: Math.max(0, Math.min(100, percentage))
      }
    }))
  }, [])

  const updateIssues = useCallback((principleId, issues) => {
    setChecks(prev => ({
      ...prev,
      [principleId]: {
        ...prev[principleId],
        issues: Math.max(0, issues)
      }
    }))
  }, [])

  const getOverallCompliance = useCallback(() => {
    const percentages = Object.values(checks).map(c => c.percentage)
    return Math.round(percentages.reduce((a, b) => a + b) / percentages.length)
  }, [checks])

  const getTotalIssues = useCallback(() => {
    return Object.values(checks).reduce((sum, c) => sum + c.issues, 0)
  }, [checks])

  const getComplianceBreakdown = useCallback(() => {
    return {
      pass: Object.values(checks).filter(c => c.status === 'pass').length,
      warning: Object.values(checks).filter(c => c.status === 'warning').length,
      fail: Object.values(checks).filter(c => c.status === 'fail').length
    }
  }, [checks])

  const resetToDefaults = useCallback(() => {
    setChecks(initialChecks)
  }, [])

  return {
    checks,
    updateStatus,
    updatePercentage,
    updateIssues,
    getOverallCompliance,
    getTotalIssues,
    getComplianceBreakdown,
    resetToDefaults
  }
}
