/**
 * Environment Variable Configuration
 * 
 * Provides type-safe access to environment variables with validation.
 * Validates required variables at runtime and provides helpful error messages.
 * 
 * Usage:
 *   import { env } from '@/src/lib/env'
 *   const appUrl = env.NEXT_PUBLIC_APP_URL
 */

/**
 * Validate that a required environment variable exists
 */
function validateRequired(value, variableName, isPublic = false) {
  if (!value) {
    const scope = isPublic ? "public" : "server-only";
    throw new Error(
      `Missing required environment variable: ${variableName} (${scope})\n` +
      `Please check your .env.local or .env.production file.`
    );
  }
  return value;
}

/**
 * Parse a numeric environment variable
 */
function parseNumber(value, variableName, defaultValue) {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(
      `Invalid number for ${variableName}: "${value}"`
    );
  }
  return parsed;
}

/**
 * Parse a boolean environment variable
 */
function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value.toLowerCase() === "true" || value === "1";
}

/**
 * Parse a comma-separated list
 */
function parseList(value, defaultValue = []) {
  if (!value) {
    return defaultValue;
  }
  return value.split(",").map(item => item.trim()).filter(Boolean);
}

/**
 * Environment variables with validation
 */
export const env = {
  // Application Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || "development",
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "DigiLocker Vault",
  NEXT_PUBLIC_APP_URL: validateRequired(
    process.env.NEXT_PUBLIC_APP_URL,
    "NEXT_PUBLIC_APP_URL",
    true
  ),

  // API Configuration
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  API_TIMEOUT: parseNumber(process.env.API_TIMEOUT, "API_TIMEOUT", 30000),
  API_LOG_ENABLED: parseBoolean(process.env.API_LOG_ENABLED, false),

  // Cloud Storage (S3)
  NEXT_PUBLIC_STORAGE_BUCKET: validateRequired(
    process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    "NEXT_PUBLIC_STORAGE_BUCKET",
    true
  ),
  NEXT_PUBLIC_STORAGE_REGION: process.env.NEXT_PUBLIC_STORAGE_REGION || "us-east-1",
  NEXT_PUBLIC_STORAGE_ENDPOINT: process.env.NEXT_PUBLIC_STORAGE_ENDPOINT || "",
  STORAGE_ACCESS_KEY_ID: process.env.STORAGE_ACCESS_KEY_ID
    ? validateRequired(process.env.STORAGE_ACCESS_KEY_ID, "STORAGE_ACCESS_KEY_ID")
    : "",
  STORAGE_SECRET_ACCESS_KEY: process.env.STORAGE_SECRET_ACCESS_KEY
    ? validateRequired(process.env.STORAGE_SECRET_ACCESS_KEY, "STORAGE_SECRET_ACCESS_KEY")
    : "",
  PRESIGNED_URL_EXPIRY_SECONDS: parseNumber(
    process.env.PRESIGNED_URL_EXPIRY_SECONDS,
    "PRESIGNED_URL_EXPIRY_SECONDS",
    900
  ),
  STORAGE_ENABLE_ENCRYPTION: parseBoolean(process.env.STORAGE_ENABLE_ENCRYPTION, false),
  STORAGE_KMS_KEY_ID: process.env.STORAGE_KMS_KEY_ID || "",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "file:./prisma/dev.db",
  DATABASE_POOL_SIZE: parseNumber(process.env.DATABASE_POOL_SIZE, "DATABASE_POOL_SIZE", 10),
  DATABASE_LOG_ENABLED: parseBoolean(process.env.DATABASE_LOG_ENABLED, false),

  // Authentication
  NEXT_PUBLIC_AUTH_ENABLED: parseBoolean(process.env.NEXT_PUBLIC_AUTH_ENABLED, false),
  AUTH_SECRET: process.env.AUTH_SECRET || "",
  AUTH_SESSION_EXPIRY_SECONDS: parseNumber(
    process.env.AUTH_SESSION_EXPIRY_SECONDS,
    "AUTH_SESSION_EXPIRY_SECONDS",
    86400
  ),
  CORS_ALLOWED_ORIGINS: parseList(
    process.env.CORS_ALLOWED_ORIGINS,
    ["http://localhost:3000"]
  ),

  // File Upload
  MAX_FILE_SIZE_MB: parseNumber(process.env.MAX_FILE_SIZE_MB, "MAX_FILE_SIZE_MB", 10),
  MAX_STORAGE_PER_USER_MB: parseNumber(
    process.env.MAX_STORAGE_PER_USER_MB,
    "MAX_STORAGE_PER_USER_MB",
    100
  ),
  ALLOWED_FILE_TYPES: parseList(
    process.env.ALLOWED_FILE_TYPES,
    [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/xml",
      "application/json",
    ]
  ),
  VIRUS_SCAN_ENABLED: parseBoolean(process.env.VIRUS_SCAN_ENABLED, false),
  VIRUS_SCAN_URL: process.env.VIRUS_SCAN_URL || "",

  // Sharing & Links
  NEXT_PUBLIC_ENABLE_SHARE_LINKS: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_SHARE_LINKS, true),
  NEXT_PUBLIC_DEFAULT_EXPIRY_MINUTES: parseNumber(
    process.env.NEXT_PUBLIC_DEFAULT_EXPIRY_MINUTES,
    "NEXT_PUBLIC_DEFAULT_EXPIRY_MINUTES",
    60
  ),
  MAX_SHARE_LINK_EXPIRY_MINUTES: parseNumber(
    process.env.MAX_SHARE_LINK_EXPIRY_MINUTES,
    "MAX_SHARE_LINK_EXPIRY_MINUTES",
    43200
  ),
  NEXT_PUBLIC_ENABLE_SHARE_PIN: parseBoolean(process.env.NEXT_PUBLIC_ENABLE_SHARE_PIN, false),
  NEXT_PUBLIC_ENABLE_SHARE_VIEW_LIMITS: parseBoolean(
    process.env.NEXT_PUBLIC_ENABLE_SHARE_VIEW_LIMITS,
    false
  ),

  // Security & Compliance
  CSP_ENABLED: parseBoolean(process.env.CSP_ENABLED, true),
  CORS_ENABLED: parseBoolean(process.env.CORS_ENABLED, true),
  RATE_LIMIT_ENABLED: parseBoolean(process.env.RATE_LIMIT_ENABLED, false),
  RATE_LIMIT_WINDOW_SECONDS: parseNumber(
    process.env.RATE_LIMIT_WINDOW_SECONDS,
    "RATE_LIMIT_WINDOW_SECONDS",
    60
  ),
  RATE_LIMIT_MAX_REQUESTS: parseNumber(
    process.env.RATE_LIMIT_MAX_REQUESTS,
    "RATE_LIMIT_MAX_REQUESTS",
    100
  ),
  REQUEST_LOG_ENABLED: parseBoolean(process.env.REQUEST_LOG_ENABLED, false),

  // Monitoring & Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  ERROR_REPORTING_ENABLED: parseBoolean(process.env.ERROR_REPORTING_ENABLED, false),
  ERROR_REPORTING_DSN: process.env.ERROR_REPORTING_DSN || "",
  ANALYTICS_ENABLED: parseBoolean(process.env.ANALYTICS_ENABLED, false),
  ANALYTICS_TOKEN: process.env.ANALYTICS_TOKEN || "",

  // Development Tools
  NEXT_PUBLIC_STRICT_MODE: parseBoolean(process.env.NEXT_PUBLIC_STRICT_MODE, true),
  DEBUG: parseBoolean(process.env.DEBUG, false),
  MOCK_API_ENABLED: parseBoolean(process.env.MOCK_API_ENABLED, false),

  // Derived values (computed from other env vars)
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  isStaging: process.env.NODE_ENV === "staging",

  /**
   * Returns true if all required environment variables are set
   * Useful for startup validation
   */
  isConfigured() {
    try {
      // Check required public variables
      if (!process.env.NEXT_PUBLIC_APP_URL) return false;
      if (!process.env.NEXT_PUBLIC_STORAGE_BUCKET) return false;

      // Check required server variables if not in development
      if (this.isProduction) {
        if (!process.env.AUTH_SECRET) return false;
        if (!process.env.DATABASE_URL) return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Returns validation errors for missing or invalid variables
   * Useful for debugging configuration issues
   */
  validate() {
    const errors = [];

    // Public variables (required)
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      errors.push("Missing: NEXT_PUBLIC_APP_URL");
    }
    if (!process.env.NEXT_PUBLIC_STORAGE_BUCKET) {
      errors.push("Missing: NEXT_PUBLIC_STORAGE_BUCKET");
    }

    // Production variables
    if (this.isProduction) {
      if (!process.env.AUTH_SECRET) {
        errors.push("Missing: AUTH_SECRET (required in production)");
      }
      if (!process.env.DATABASE_URL) {
        errors.push("Missing: DATABASE_URL (required in production)");
      }
      if (!process.env.STORAGE_ACCESS_KEY_ID) {
        errors.push("Missing: STORAGE_ACCESS_KEY_ID (required in production)");
      }
      if (!process.env.STORAGE_SECRET_ACCESS_KEY) {
        errors.push("Missing: STORAGE_SECRET_ACCESS_KEY (required in production)");
      }
    }

    // Validate numeric values
    try {
      parseNumber(process.env.MAX_FILE_SIZE_MB, "MAX_FILE_SIZE_MB", 10);
    } catch (e) {
      errors.push(e.message);
    }

    return errors;
  },
};

/**
 * Validate environment at startup (call in entry point if needed)
 */
export function validateEnvironment() {
  const errors = env.validate();
  if (errors.length > 0) {
    console.error("❌ Environment validation failed:");
    errors.forEach(error => console.error(`  - ${error}`));
    if (process.env.NODE_ENV === "production") {
      throw new Error("Environment validation failed. See logs for details.");
    }
  } else {
    console.log("✅ Environment validated successfully");
  }
}
