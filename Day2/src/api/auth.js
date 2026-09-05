// Authentication API Handlers
// All handlers use async/await pattern

import apiClient from './client'

/**
 * Login user
 */
export const login = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const response = await apiClient.post('/api/v1/auth/login', {
      email,
      password
    })

    if (!response.success) {
      throw new Error(response.error?.message || 'Login failed')
    }

    const { token, refreshToken, user } = response.data.data || {}

    // Store tokens
    if (token) {
      localStorage.setItem('auth_token', token)
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }

    return {
      success: true,
      token,
      user,
      message: 'Login successful'
    }
  } catch (error) {
    console.error('Error during login:', error.message)
    return {
      success: false,
      error: error.message,
      token: null,
      user: null
    }
  }
}

/**
 * Logout user
 */
export const logout = async () => {
  try {
    // Call logout endpoint to invalidate token server-side
    await apiClient.post('/api/v1/auth/logout', {})

    // Clear tokens from storage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')

    return {
      success: true,
      message: 'Logout successful'
    }
  } catch (error) {
    console.error('Error during logout:', error.message)
    // Still clear tokens even if request fails
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Register new user
 */
export const register = async (userData) => {
  try {
    const { email, password, firstName, lastName } = userData

    if (!email || !password || !firstName) {
      throw new Error('Email, password, and first name are required')
    }

    const response = await apiClient.post('/api/v1/auth/register', {
      email,
      password,
      firstName,
      lastName
    })

    if (!response.success) {
      throw new Error(response.error?.message || 'Registration failed')
    }

    return {
      success: true,
      user: response.data.data?.user || null,
      message: 'Registration successful. Please check your email.'
    }
  } catch (error) {
    console.error('Error during registration:', error.message)
    return {
      success: false,
      error: error.message,
      user: null
    }
  }
}

/**
 * Refresh authentication token
 */
export const refreshToken = async () => {
  try {
    const refreshTokenValue = localStorage.getItem('refresh_token')

    if (!refreshTokenValue) {
      throw new Error('No refresh token found')
    }

    const response = await apiClient.post('/api/v1/auth/refresh', {
      refreshToken: refreshTokenValue
    })

    if (!response.success) {
      throw new Error(response.error?.message || 'Token refresh failed')
    }

    const { token } = response.data.data || {}

    if (token) {
      localStorage.setItem('auth_token', token)
    }

    return {
      success: true,
      token
    }
  } catch (error) {
    console.error('Error refreshing token:', error.message)
    // Clear tokens on refresh failure
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    return {
      success: false,
      error: error.message,
      token: null
    }
  }
}

/**
 * Verify current user
 */
export const verifyUser = async () => {
  try {
    const response = await apiClient.get('/api/v1/auth/me')

    if (!response.success) {
      throw new Error(response.error?.message || 'Verification failed')
    }

    return {
      success: true,
      user: response.data.data || null
    }
  } catch (error) {
    console.error('Error verifying user:', error.message)
    // Clear tokens on verification failure
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    return {
      success: false,
      error: error.message,
      user: null
    }
  }
}

/**
 * Request password reset
 */
export const requestPasswordReset = async (email) => {
  try {
    if (!email) {
      throw new Error('Email is required')
    }

    const response = await apiClient.post('/api/v1/auth/password-reset-request', {
      email
    })

    if (!response.success) {
      throw new Error(response.error?.message || 'Request failed')
    }

    return {
      success: true,
      message: 'Password reset link sent to your email'
    }
  } catch (error) {
    console.error('Error requesting password reset:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Reset password with token
 */
export const resetPassword = async (token, newPassword) => {
  try {
    if (!token || !newPassword) {
      throw new Error('Reset token and new password are required')
    }

    const response = await apiClient.post('/api/v1/auth/password-reset', {
      token,
      newPassword
    })

    if (!response.success) {
      throw new Error(response.error?.message || 'Password reset failed')
    }

    return {
      success: true,
      message: 'Password reset successful'
    }
  } catch (error) {
    console.error('Error resetting password:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get current auth token
 */
export const getToken = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    return token
  } catch (error) {
    console.error('Error getting token:', error.message)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      return false
    }

    const response = await apiClient.get('/api/v1/auth/verify')
    return response.success
  } catch (error) {
    return false
  }
}

export default {
  login,
  logout,
  register,
  refreshToken,
  verifyUser,
  requestPasswordReset,
  resetPassword,
  getToken,
  isAuthenticated
}
