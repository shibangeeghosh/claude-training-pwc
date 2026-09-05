import { useState, useMemo, useCallback } from 'react'

export default function useSearch(items, searchableFields = ['title', 'id']) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = useMemo(() => {
    return items.filter(item => {
      // Search term matching
      const matchesSearch = searchableFields.some(field =>
        String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
      )

      // Status filter matching
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus

      return matchesSearch && matchesFilter
    })
  }, [items, searchTerm, filterStatus, searchableFields])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setFilterStatus('all')
  }, [])

  const stats = useMemo(() => {
    const total = items.length
    const filtered_count = filtered.length
    const compliant = items.filter(i => i.status === 'compliant').length
    const warning = items.filter(i => i.status === 'warning').length
    const nonCompliant = items.filter(i => i.status === 'fail' || i.status === 'non-compliant').length

    return {
      total,
      filtered_count,
      compliant,
      warning,
      nonCompliant,
      matchRate: total > 0 ? Math.round((filtered_count / total) * 100) : 100
    }
  }, [items, filtered])

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filtered,
    clearSearch,
    clearFilters,
    stats
  }
}
