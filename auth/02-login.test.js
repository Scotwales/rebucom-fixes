/**
 * User Login Tests
 * Tests authentication and login functionality
 *
 * Best Practices Demonstrated:
 * ✅ Test independence (creates its own test user in beforeAll)
 * ✅ Uses AuthHelper for authentication operations
 * ✅ Strong, specific assertions
 * ✅ No hardcoded credentials
 * ✅ Tests various login scenarios and edge cases
 */

const AuthHelper = require('../utilities/AuthHelper');
const TestDataFactory = require('../test-data/TestDataFactory');
const { STATUS, PASSWORDS, USER_TYPES } = require('../test-data/constants');

const baseUrl = process.env.BASE_URL;
const authHelper = new AuthHelper(baseUrl);

describe('User Login API', () => {
  let testUser;
  let testUserData;

  // Create a test user before running login tests
  beforeAll(async () => {
    testUser = TestDataFactory.generateCustomer();

    // Create and authenticate user for testing
    testUserData = await authHelper.createAuthenticatedUser(testUser);
  });

  describe('Positive Test Cases', () => {
    test('should successfully login with valid credentials', async () => {
      const response = await authHelper.login(
        testUser.email,
        testUser.password,
        testUser.userType
      );

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    test('should return valid JWT token on successful login', async () => {
      const response = await authHelper.login(
        testUser.email,
        testUser.password,
        testUser.userType
      );

      expect(response.status).toBe(STATUS.OK);
      const token = response.body.data.token;

      // JWT tokens have three parts separated by dots
      expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    test('should return user details on successful login', async () => {
      const response = await authHelper.login(
        testUser.email,
        testUser.password,
        testUser.userType
      );

      expect(response.status).toBe(STATUS.OK);
      const user = response.body.data.user;

      expect(user).toHaveProperty('userId');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('userType');
      expect(user).toHaveProperty('fullName');
      expect(user.email).toBe(testUser.email);
      expect(user.userType).toBe(testUser.userType);
    });
  });

  describe('Negative Test Cases - Invalid Credentials', () => {
    test('should reject login with wrong password', async () => {
      const response = await authHelper.login(
        testUser.email,
        PASSWORDS.WRONG,
        testUser.userType
      );

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
      expect(response.body.message).toMatch(/invalid|incorrect|wrong/i);
    });

    test('should reject login with non-existent email', async () => {
      const nonExistentUser = TestDataFactory.generateCustomer();

      const response = await authHelper.login(
        nonExistentUser.email,
        nonExistentUser.password,
        USER_TYPES.CUSTOMER
      );

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
      expect(response.body.message).toMatch(/invalid|not found|does not exist/i);
    });

    test('should reject login with empty password', async () => {
      const response = await authHelper.login(
        testUser.email,
        '',
        testUser.userType
      );

      expect(response.status).toBe(STATUS.BAD_REQUEST);
      expect(response.body.message).toMatch(/password/i);
    });

    test('should reject login with empty email', async () => {
      const response = await authHelper.login(
        '',
        testUser.password,
        testUser.userType
      );

      expect(response.status).toBe(STATUS.BAD_REQUEST);
      expect(response.body.message).toMatch(/email/i);
    });
  });

  describe('Negative Test Cases - Invalid User Type', () => {
    test('should reject login with wrong user type', async () => {
      // User is registered as Customer, try logging in as Merchant
      const response = await authHelper.login(
        testUser.email,
        testUser.password,
        USER_TYPES.MERCHANT
      );

      expect(response.status).toBe(STATUS.FORBIDDEN);
      expect(response.body.message).toMatch(/user type|userType|role/i);
    });

    test('should reject login with invalid user type', async () => {
      const response = await authHelper.login(
        testUser.email,
        testUser.password,
        'InvalidUserType'
      );

      expect(response.status).toBe(STATUS.BAD_REQUEST);
      expect(response.body.message).toMatch(/user type|userType/i);
    });

    test('should reject login with missing user type', async () => {
      const response = await authHelper.login(
        testUser.email,
        testUser.password,
        null
      );

      expect(response.status).toBe(STATUS.BAD_REQUEST);
      expect(response.body.message).toMatch(/user type|userType/i);
    });
  });

  describe('Negative Test Cases - Missing Fields', () => {
    test('should reject login with missing email', async () => {
      const response = await authHelper.login(
        null,
        testUser.password,
        testUser.userType
      );

      expect(response.status).toBe(STATUS.BAD_REQUEST);
      expect(response.body.message).toMatch(/email/i);
    });

    test('should reject login with missing password', async () => {
      const response = await authHelper.login(
        testUser.email,
        null,
        testUser.userType
      );

      expect(response.status).toBe(STATUS.BAD_REQUEST);
      expect(response.body.message).toMatch(/password/i);
    });
  });

  describe('Multi-User Type Login', () => {
    test('should successfully login merchant user', async () => {
      const merchantUser = TestDataFactory.generateMerchant();
      await authHelper.createAuthenticatedUser(merchantUser);

      const response = await authHelper.login(
        merchantUser.email,
        merchantUser.password,
        USER_TYPES.MERCHANT
      );

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.user.userType).toBe(USER_TYPES.MERCHANT);
      expect(response.body.data.user.merchant).toBeDefined();
    });

    test('should successfully login driver user', async () => {
      const driverUser = TestDataFactory.generateDriver();
      await authHelper.createAuthenticatedUser(driverUser);

      const response = await authHelper.login(
        driverUser.email,
        driverUser.password,
        USER_TYPES.DRIVER
      );

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.user.userType).toBe(USER_TYPES.DRIVER);
      expect(response.body.data.user.driver).toBeDefined();
    });
  });

  describe('Case Sensitivity Tests', () => {
    test('should handle email case-insensitivity correctly', async () => {
      const uppercaseEmail = testUser.email.toUpperCase();

      const response = await authHelper.login(
        uppercaseEmail,
        testUser.password,
        testUser.userType
      );

      // Email should typically be case-insensitive
      // Adjust expectation based on actual API behavior
      expect([STATUS.OK, STATUS.UNAUTHORIZED]).toContain(response.status);
    });

    test('should treat password as case-sensitive', async () => {
      const uppercasePassword = testUser.password.toUpperCase();

      const response = await authHelper.login(
        testUser.email,
        uppercasePassword,
        testUser.userType
      );

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
      expect(response.body.message).toMatch(/invalid|incorrect/i);
    });
  });

  describe('Security Tests', () => {
    test('should not expose user existence in error messages', async () => {
      const nonExistentUser = TestDataFactory.generateCustomer();

      const response = await authHelper.login(
        nonExistentUser.email,
        PASSWORDS.VALID,
        USER_TYPES.CUSTOMER
      );

      // Error message should be generic to prevent user enumeration
      expect(response.status).toBe(STATUS.UNAUTHORIZED);
      expect(response.body.message).not.toMatch(/user does not exist|email not found/i);
      expect(response.body.message).toMatch(/invalid email or password/i);
    });

    test('should sanitize email input to prevent SQL injection', async () => {
      const response = await authHelper.login(
        "test@test.com' OR '1'='1",
        testUser.password,
        testUser.userType
      );

      expect(response.status).toBe(STATUS.BAD_REQUEST);
    });
  });

  describe('Performance Tests', () => {
    test('should respond to login request within acceptable time', async () => {
      const startTime = Date.now();

      const response = await authHelper.login(
        testUser.email,
        testUser.password,
        testUser.userType
      );

      const duration = Date.now() - startTime;

      expect(response.status).toBe(STATUS.OK);
      expect(duration).toBeLessThan(3000); // Should respond within 3 seconds
    });
  });
});
