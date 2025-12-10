/**
 * Authentication Helper
 * Provides reusable authentication utilities for tests
 * Promotes DRY principle and test independence
 */

const request = require('supertest');
const { STATUS, ENDPOINTS } = require('../test-data/constants');

class AuthHelper {
  /**
   * @param {string} baseUrl - Base URL for the API
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Response>} Supertest response
   */
  async signup(userData) {
    const response = await request(this.baseUrl)
      .post(ENDPOINTS.SIGNUP)
      .send(userData);

    return response;
  }

  /**
   * Login with credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} userType - User type (Customer, Merchant, Driver, etc.)
   * @param {string} teamId - Optional team ID for merchant team login
   * @returns {Promise<Response>} Supertest response
   */
  async login(email, password, userType, teamId = null) {
    const payload = { email, password, userType };
    if (teamId) {
      payload.teamId = teamId;
    }

    const response = await request(this.baseUrl)
      .post(ENDPOINTS.LOGIN)
      .send(payload);

    return response;
  }

  /**
   * Create a test user and get auth token (all-in-one helper)
   * This makes tests independent by creating their own test data
   *
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data with token
   * @throws {Error} If signup or login fails
   */
  async createAuthenticatedUser(userData) {
    // Register the user
    const signupResponse = await this.signup(userData);

    if (signupResponse.status !== STATUS.CREATED && signupResponse.status !== STATUS.OK) {
      throw new Error(
        `Signup failed: ${signupResponse.status} - ${JSON.stringify(signupResponse.body)}`
      );
    }

    // Login to get token
    const loginResponse = await this.login(
      userData.email,
      userData.password,
      userData.userType
    );

    if (loginResponse.status !== STATUS.OK) {
      throw new Error(
        `Login failed: ${loginResponse.status} - ${JSON.stringify(loginResponse.body)}`
      );
    }

    const user = loginResponse.body.data.user;
    const token = loginResponse.body.data.token;

    return {
      token: token,
      email: user.email,
      userId: user.userId,
      userType: user.userType,
      fullName: user.fullName,
      phone: user.phoneNumber,
      merchantId: user.merchant?.merchantId || null,
      customerId: user.customer?.customerId || null,
      driverId: user.driver?.driverId || null,
      teamId: user.merchantTeam?.teamId || null,
      userData: userData // Store original signup data for reference
    };
  }

  /**
   * Check user roles via email
   * @param {string} email - User email
   * @returns {Promise<Response>} Supertest response
   */
  async checkUserRoles(email) {
    const response = await request(this.baseUrl)
      .post(ENDPOINTS.ROLES)
      .send({ email });

    return response;
  }

  /**
   * Send OTP to email
   * @param {string} email - User email
   * @param {string} verificationType - Type of verification (signup, login, forgotPassword)
   * @returns {Promise<Response>} Supertest response
   */
  async sendEmailOTP(email, verificationType) {
    const response = await request(this.baseUrl)
      .post(ENDPOINTS.SEND_OTP_EMAIL)
      .send({ email, verificationType });

    return response;
  }

  /**
   * Send OTP to phone
   * @param {string} phoneNumber - User phone number
   * @param {string} verificationType - Type of verification
   * @returns {Promise<Response>} Supertest response
   */
  async sendSmsOTP(phoneNumber, verificationType) {
    const response = await request(this.baseUrl)
      .post(ENDPOINTS.SEND_OTP_SMS)
      .send({ phoneNumber, verificationType });

    return response;
  }

  /**
   * Verify email OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @returns {Promise<Response>} Supertest response
   */
  async verifyEmailOTP(email, otp) {
    const response = await request(this.baseUrl)
      .post(ENDPOINTS.VERIFY_EMAIL)
      .send({ email, otp });

    return response;
  }

  /**
   * Verify SMS OTP
   * @param {string} phoneNumber - User phone number
   * @param {string} otp - OTP code
   * @returns {Promise<Response>} Supertest response
   */
  async verifySmsOTP(phoneNumber, otp) {
    const response = await request(this.baseUrl)
      .post(ENDPOINTS.VERIFY_SMS)
      .send({ phoneNumber, otp });

    return response;
  }

  /**
   * View OTP (TEST ENVIRONMENT ONLY - Security Risk!)
   * This endpoint should NEVER exist in production
   *
   * @param {string} identifier - Email or phone number
   * @returns {Promise<string>} OTP code
   * @throws {Error} If endpoint is not available or fails
   */
  async getOTPFromTestEndpoint(identifier) {
    // Only allow in test environments
    if (!this.baseUrl.includes('test.') && !process.env.ALLOW_OTP_VIEW) {
      throw new Error(
        '❌ OTP view endpoint is only available in test environments. ' +
        'Set ALLOW_OTP_VIEW=true in .env if this is a test environment.'
      );
    }

    const response = await request(this.baseUrl)
      .post(ENDPOINTS.VIEW_OTP)
      .send({ identifier });

    if (response.status !== STATUS.OK) {
      throw new Error(
        `Failed to retrieve OTP: ${response.status} - ${JSON.stringify(response.body)}`
      );
    }

    return response.body.data;
  }

  /**
   * Change password (requires authentication)
   * @param {string} token - Auth token
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Response>} Supertest response
   */
  async changePassword(token, currentPassword, newPassword) {
    const response = await request(this.baseUrl)
      .post(ENDPOINTS.CHANGE_PASSWORD)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword, newPassword });

    return response;
  }

  /**
   * Reset password (forgot password flow)
   * @param {string} email - User email
   * @param {string} phoneNumber - User phone number
   * @param {string} newPassword - New password
   * @returns {Promise<Response>} Supertest response
   */
  async resetPassword(email, phoneNumber, newPassword) {
    const response = await request(this.baseUrl)
      .post(ENDPOINTS.RESET_PASSWORD)
      .send({ email, phoneNumber, newPassword });

    return response;
  }

  /**
   * Switch account type
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} userType - New user type to switch to
   * @param {string} teamId - Optional team ID
   * @returns {Promise<Response>} Supertest response
   */
  async switchAccount(email, password, userType, teamId = null) {
    const payload = { email, password, userType };
    if (teamId) {
      payload.teamId = teamId;
    }

    const response = await request(this.baseUrl)
      .post(ENDPOINTS.SWITCH_ACCOUNT)
      .send(payload);

    return response;
  }

  /**
   * Make an authenticated request
   * @param {string} method - HTTP method (get, post, put, delete)
   * @param {string} endpoint - API endpoint
   * @param {string} token - Auth token
   * @param {Object} data - Optional request body
   * @returns {Promise<Response>} Supertest response
   */
  async authenticatedRequest(method, endpoint, token, data = null) {
    let req = request(this.baseUrl)[method.toLowerCase()](endpoint)
      .set('Authorization', `Bearer ${token}`);

    if (data) {
      req = req.send(data);
    }

    return await req;
  }
}

module.exports = AuthHelper;
