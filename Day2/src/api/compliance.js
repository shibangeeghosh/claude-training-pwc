// Compliance API Handlers
// All handlers use async/await pattern

import apiClient from './client'

/**
 * Fetch compliance checks for a record
 */
export const fetchComplianceChecks = async (recordId) => {
  try {
    if (!recordId) {
      throw new Error('Record ID is required')
    }

    const response = await apiClient.get(`/api/v1/records/${recordId}/compliance`)

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch compliance checks')
    }

    return {
      success: true,
      data: response.data.data || null
    }
  } catch (error) {
    console.error(`Error fetching compliance for record ${recordId}:`, error.message)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
}

/**
 * Get overall compliance score
 */
export const fetchOverallCompliance = async () => {
  try {
    const response = await apiClient.get('/api/v1/compliance/overall')

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch overall compliance')
    }

    return {
      success: true,
      score: response.data.data?.score || 0,
      details: response.data.data || {}
    }
  } catch (error) {
    console.error('Error fetching overall compliance:', error.message)
    return {
      success: false,
      error: error.message,
      score: 0,
      details: {}
    }
  }
}

/**
 * Get compliance trend (historical data)
 */
export const fetchComplianceTrend = async (period = '6months') => {
  try {
    const validPeriods = ['1month', '3months', '6months', '1year']
    if (!validPeriods.includes(period)) {
      throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`)
    }

    const response = await apiClient.get(`/api/v1/compliance/trend?period=${period}`)

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch compliance trend')
    }

    return {
      success: true,
      trend: response.data.data || [],
      period
    }
  } catch (error) {
    console.error('Error fetching compliance trend:', error.message)
    return {
      success: false,
      error: error.message,
      trend: [],
      period: '6months'
    }
  }
}

/**
 * Get compliance breakdown by principle
 */
export const fetchComplianceByPrinciple = async () => {
  try {
    const response = await apiClient.get('/api/v1/compliance/by-principle')

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch compliance by principle')
    }

    return {
      success: true,
      principles: response.data.data || []
    }
  } catch (error) {
    console.error('Error fetching compliance by principle:', error.message)
    return {
      success: false,
      error: error.message,
      principles: []
    }
  }
}

/**
 * Update compliance check for a record
 */
export const updateComplianceCheck = async (recordId, principleId, checkData) => {
  try {
    if (!recordId || !principleId) {
      throw new Error('Record ID and principle ID are required')
    }

    const response = await apiClient.patch(
      `/api/v1/records/${recordId}/compliance/${principleId}`,
      checkData
    )

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update compliance check')
    }

    return {
      success: true,
      data: response.data.data || null,
      message: 'Compliance check updated successfully'
    }
  } catch (error) {
    console.error(`Error updating compliance check:`, error.message)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
}

/**
 * Generate compliance report
 */
export const generateComplianceReport = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters)

    const response = await apiClient.get(`/api/v1/compliance/report?${params.toString()}`)

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to generate report')
    }

    return {
      success: true,
      report: response.data.data || null,
      format: 'json'
    }
  } catch (error) {
    console.error('Error generating compliance report:', error.message)
    return {
      success: false,
      error: error.message,
      report: null
    }
  }
}

/**
 * Export compliance report
 */
export const exportComplianceReport = async (format = 'pdf', filters = {}) => {
  try {
    const validFormats = ['pdf', 'csv', 'xlsx', 'json']
    if (!validFormats.includes(format)) {
      throw new Error(`Invalid format. Must be one of: ${validFormats.join(', ')}`)
    }

    const params = new URLSearchParams({
      format,
      ...filters
    })

    const response = await apiClient.get(
      `/api/v1/compliance/export?${params.toString()}`,
      { headers: { 'Accept': `application/${format}` } }
    )

    if (!response.success) {
      throw new Error(response.error?.message || 'Export failed')
    }

    return {
      success: true,
      data: response.data,
      format
    }
  } catch (error) {
    console.error('Error exporting compliance report:', error.message)
    return {
      success: false,
      error: error.message,
      format
    }
  }
}

/**
 * Get compliance statistics
 */
export const fetchComplianceStats = async () => {
  try {
    const response = await apiClient.get('/api/v1/compliance/stats')

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch statistics')
    }

    return {
      success: true,
      stats: response.data.data || {
        total: 0,
        compliant: 0,
        warning: 0,
        nonCompliant: 0
      }
    }
  } catch (error) {
    console.error('Error fetching compliance statistics:', error.message)
    return {
      success: false,
      error: error.message,
      stats: { total: 0, compliant: 0, warning: 0, nonCompliant: 0 }
    }
  }
}

/**
 * Request compliance audit
 */
export const requestComplianceAudit = async (auditData) => {
  try {
    if (!auditData.scope) {
      throw new Error('Audit scope is required')
    }

    const response = await apiClient.post('/api/v1/compliance/audit-request', auditData)

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to request audit')
    }

    return {
      success: true,
      auditId: response.data.data?.id || null,
      message: 'Audit request submitted successfully'
    }
  } catch (error) {
    console.error('Error requesting compliance audit:', error.message)
    return {
      success: false,
      error: error.message,
      auditId: null
    }
  }
}

export default {
  fetchComplianceChecks,
  fetchOverallCompliance,
  fetchComplianceTrend,
  fetchComplianceByPrinciple,
  updateComplianceCheck,
  generateComplianceReport,
  exportComplianceReport,
  fetchComplianceStats,
  requestComplianceAudit
}
