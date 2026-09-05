import { useState, useMemo, useCallback } from 'react'

export default function useFilteredData(
  initialData,
  searchFields = ['title', 'id'],
  filterField = 'status'
) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  const filtered = useMemo(() => {
    let result = [...initialData]

    // Apply search
    if (searchTerm) {
      result = result.filter(item =>
        searchFields.some(field =>
          String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(item => item[key] === value)
      }
    })

    // Apply sorting
    result.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

    return result
  }, [initialData, searchTerm, filters, sortBy, sortOrder, searchFields])

  const addFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const removeFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchTerm('')
    setFilters({})
    setSortBy('date')
    setSortOrder('desc')
  }, [])

  const getFilterOptions = useCallback((fieldName) => {
    return [...new Set(initialData.map(item => item[fieldName]))]
  }, [initialData])

  const getSummary = useCallback(() => {
    return {
      total: initialData.length,
      filtered: filtered.length,
      reduction: initialData.length - filtered.length,
      filterPercentage: Math.round((filtered.length / initialData.length) * 100)
    }
  }, [initialData, filtered])

  return {
    searchTerm,
    setSearchTerm,
    filters,
    addFilter,
    removeFilter,
    clearAllFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filtered,
    getFilterOptions,
    getSummary
  }
}
