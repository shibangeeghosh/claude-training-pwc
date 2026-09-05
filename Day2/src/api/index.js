// API Module Index
// Centralized API handler exports

export { default as apiClient, ApiClient, ApiResponse } from './client'
export * as recordsAPI from './records'
export * as complianceAPI from './compliance'
export * as authAPI from './auth'

// Convenience exports for common operations
import * as records from './records'
import * as compliance from './compliance'
import * as auth from './auth'

export const api = {
  records,
  compliance,
  auth
}

export default api
