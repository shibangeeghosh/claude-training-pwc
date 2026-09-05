// Environment Configuration
// Centralizes access to environment variables with defaults and validation

const ENV_VARS = {
  // Application
  APP_NAME: import.meta.env.VITE_APP_NAME || 'ALCOA+ QA Compliance',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',

  // Database
  DB_HOST: import.meta.env.VITE_DB_HOST || 'localhost',
  DB_PORT: import.meta.env.VITE_DB_PORT || '5432',
  DB_NAME: import.meta.env.VITE_DB_NAME || 'alcoa_qa_dev',
  DB_USER: import.meta.env.VITE_DB_USER || 'dev_user',

  // Environment
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'debug',

  // Derived
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
}

// Construct database connection string for reference
const DB_CONNECTION_STRING = `postgresql://${ENV_VARS.DB_USER}@${ENV_VARS.DB_HOST}:${ENV_VARS.DB_PORT}/${ENV_VARS.DB_NAME}`

// Validate critical environment variables
const validateEnvironment = () => {
  const required = ['DB_HOST', 'DB_PORT', 'DB_NAME']
  const missing = required.filter(key => !ENV_VARS[key])

  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`)
  }

  // Log environment info in development with debug flag
  const enableDebugLogging = ENV_VARS.IS_DEV && (
    import.meta.env.VITE_DEBUG_ENV === 'true' ||
    localStorage.getItem('DEBUG_ENV') === 'true'
  )

  if (enableDebugLogging) {
    const config = [
      `App: ${ENV_VARS.APP_NAME} v${ENV_VARS.APP_VERSION}`,
      `Environment: ${ENV_VARS.ENVIRONMENT}`,
      `API Base: ${ENV_VARS.API_BASE_URL}`,
      `Database: ${ENV_VARS.DB_HOST}:${ENV_VARS.DB_PORT}/${ENV_VARS.DB_NAME}`
    ]
    console.group('📋 Environment Configuration')
    config.forEach(line => console.log(line))
    console.groupEnd()
  }
}

// Run validation on module load
validateEnvironment()

// Export configuration
export default ENV_VARS
export { DB_CONNECTION_STRING }

// Export helper to get env variable safely
export const getEnv = (key, defaultValue = undefined) => {
  return ENV_VARS[key] ?? defaultValue
}

// Export helper to check if running in specific environment
export const isEnvironment = (env) => ENV_VARS.ENVIRONMENT === env
export const isDevelopment = () => isEnvironment('development')
export const isProduction = () => isEnvironment('production')
