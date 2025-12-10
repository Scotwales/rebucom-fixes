/**
 * Shared Constants for API Tests
 * Centralizes all magic strings and values used across test suites
 */

module.exports = {
  // HTTP Status Codes
  STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500
  },

  // Password Patterns for Testing
  PASSWORDS: {
    VALID: 'Password1@',
    VALID_ALT: 'Password@2',
    NEW_VALID: 'NewPassword1@',
    NO_SPECIAL: 'Password1',
    NO_NUMBER: 'Password@',
    NO_UPPERCASE: 'password1@',
    TOO_SHORT: 'Pass1@',
    WRONG: 'WrongPassword@123',
    EMPTY: ''
  },

  // OTP Verification Types
  VERIFICATION_TYPES: {
    SIGNUP: 'signup',
    LOGIN: 'login',
    FORGOT_PASSWORD: 'forgotPassword'
  },

  // User Types
  USER_TYPES: {
    CUSTOMER: 'Customer',
    MERCHANT: 'Merchant',
    DRIVER: 'Driver',
    MERCHANT_TEAM: 'MerchantTeam',
    ADMIN: 'Admin'
  },

  // API Endpoints
  ENDPOINTS: {
    SIGNUP: 'auth/signup',
    LOGIN: 'auth/login',
    ROLES: 'auth/roles',
    SEND_OTP_EMAIL: 'auth/send-otp-email',
    SEND_OTP_SMS: 'auth/send-otp-sms',
    VERIFY_EMAIL: 'auth/verify-email',
    VERIFY_SMS: 'auth/verify-sms',
    VIEW_OTP: 'auth/view-Otp', // Test environment only!
    CHANGE_PASSWORD: 'auth/change-password',
    RESET_PASSWORD: 'auth/reset-password',
    FORGOT_PASSWORD: 'auth/forgot-password',
    SWITCH_ACCOUNT: 'auth/switch-account'
  },

  // Test Timeouts (in milliseconds)
  TIMEOUTS: {
    DEFAULT: 30000,
    LONG_OPERATION: 60000,
    OTP_WAIT: 10000,
    SHORT: 5000
  },

  // Success Messages (adjust based on actual API responses)
  MESSAGES: {
    SIGNUP_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'User logged in successfully',
    OTP_SENT: 'OTP sent successfully',
    OTP_VERIFIED: 'OTP verified successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    PASSWORD_RESET: 'Password reset successful',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    INVALID_OTP: 'Invalid OTP',
    USER_EXISTS: 'User already exists',
    WEAK_PASSWORD: 'Password is too weak'
  },

  // Field Length Limits (for boundary testing)
  LIMITS: {
    USERNAME_MIN: 3,
    USERNAME_MAX: 50,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 128,
    EMAIL_MAX: 255,
    PHONE_LENGTH: 11 // UK phone numbers
  }
};
