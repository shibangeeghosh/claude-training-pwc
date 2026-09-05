// Records API Handlers
// All handlers use async/await pattern for clean, readable async code

import apiClient from './client'

/**
 * Fetch all records with pagination
 */
export const fetchRecords = async (page = 1, pageSize = 20, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page,
      pageSize,
      ...filters
    })

    const response = await apiClient.get(`/api/v1/records?${params.toString()}`)

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch records')
    }

    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination || {}
    }
  } catch (error) {
    console.error('Error fetching records:', error.message)
    return {
      success: false,
      error: error.message,
      data: [],
      pagination: {}
    }
  }
}

/**
 * Fetch single record by ID
 */
export const fetchRecord = async (recordId) => {
  try {
    if (!recordId) {
      throw new Error('Record ID is required')
    }

    const response = await apiClient.get(`/api/v1/records/${recordId}`)

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch record')
    }

    return {
      success: true,
      data: response.data.data || null
    }
  } catch (error) {
    console.error(`Error fetching record ${recordId}:`, error.message)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
}

/**
 * Create new record
 */
export const createRecord = async (recordData) => {
  try {
    if (!recordData.title || !recordData.status) {
      throw new Error('Title and status are required')
    }

    const response = await apiClient.post('/api/v1/records', recordData)

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create record')
    }

    return {
      success: true,
      data: response.data.data || null,
      message: 'Record created successfully'
    }
  } catch (error) {
    console.error('Error creating record:', error.message)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
}

/**
 * Update existing record
 */
export const updateRecord = async (recordId, updates) => {
  try {
    if (!recordId) {
      throw new Error('Record ID is required')
    }

    const response = await apiClient.put(`/api/v1/records/${recordId}`, updates)

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update record')
    }

    return {
      success: true,
      data: response.data.data || null,
      message: 'Record updated successfully'
    }
  } catch (error) {
    console.error(`Error updating record ${recordId}:`, error.message)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
}

/**
 * Patch record (partial update)
 */
export const patchRecord = async (recordId, updates) => {
  try {
    if (!recordId) {
      throw new Error('Record ID is required')
    }

    const response = await apiClient.patch(`/api/v1/records/${recordId}`, updates)

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to patch record')
    }

    return {
      success: true,
      data: response.data.data || null,
      message: 'Record updated successfully'
    }
  } catch (error) {
    console.error(`Error patching record ${recordId}:`, error.message)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
}

/**
 * Delete record
 */
export const deleteRecord = async (recordId) => {
  try {
    if (!recordId) {
      throw new Error('Record ID is required')
    }

    const response = await apiClient.delete(`/api/v1/records/${recordId}`)

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete record')
    }

    return {
      success: true,
      message: 'Record deleted successfully'
    }
  } catch (error) {
    console.error(`Error deleting record ${recordId}:`, error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Bulk create records
 */
export const bulkCreateRecords = async (recordsList) => {
  try {
    if (!Array.isArray(recordsList) || recordsList.length === 0) {
      throw new Error('Records list is required and must not be empty')
    }

    const requests = recordsList.map(record =>
      apiClient.post('/api/v1/records', record)
    )

    const results = await apiClient.batch(requests)

    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    return {
      success: failed.length === 0,
      successful: successful.map(r => r.data),
      failed: failed.map(r => r.error),
      summary: {
        total: recordsList.length,
        successCount: successful.length,
        failCount: failed.length
      }
    }
  } catch (error) {
    console.error('Error in bulk create:', error.message)
    return {
      success: false,
      error: error.message,
      successful: [],
      failed: [],
      summary: { total: 0, successCount: 0, failCount: 0 }
    }
  }
}

/**
 * Search records
 */
export const searchRecords = async (query, filters = {}) => {
  try {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query is required')
    }

    const params = new URLSearchParams({
      search: query,
      ...filters
    })

    const response = await apiClient.get(`/api/v1/records/search?${params.toString()}`)

    if (!response.success) {
      throw new Error(response.error?.message || 'Search failed')
    }

    return {
      success: true,
      results: response.data.data || [],
      total: response.data.pagination?.total || 0
    }
  } catch (error) {
    console.error('Error searching records:', error.message)
    return {
      success: false,
      error: error.message,
      results: [],
      total: 0
    }
  }
}

/**
 * Export records to CSV
 */
export const exportRecords = async (format = 'csv', filters = {}) => {
  try {
    const validFormats = ['csv', 'json', 'xlsx']
    if (!validFormats.includes(format)) {
      throw new Error(`Invalid format. Must be one of: ${validFormats.join(', ')}`)
    }

    const params = new URLSearchParams({
      format,
      ...filters
    })

    const response = await apiClient.get(`/api/v1/records/export?${params.toString()}`)

    if (!response.success) {
      throw new Error(response.error?.message || 'Export failed')
    }

    return {
      success: true,
      data: response.data,
      format
    }
  } catch (error) {
    console.error('Error exporting records:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  fetchRecords,
  fetchRecord,
  createRecord,
  updateRecord,
  patchRecord,
  deleteRecord,
  bulkCreateRecords,
  searchRecords,
  exportRecords
}
