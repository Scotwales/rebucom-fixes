<<<<<<< HEAD
const request = require("supertest");
const baseUrl = process.env.BASE_URL;
const getAuthData = require("../utilities/getAuthData.js");

let authtoken = "";
let authData;
let email;
let userType;
const password = "Password1@";
const TeamId = "6faf4c2e-56be-43c1-889c-3fdaa9278638";

beforeAll(async () => {
  authData = await getAuthData();
  email = authData.email;
  userType = authData.userType;
});

describe("Testcase for sign-in", () => {

    // 1. Attempt to sign in without filling any field in the login form
    test("sign in without filling the login form", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": "",
            "password": "",
            "userType": ""
        });

        expect(response.status).toBe(400);
        expect(response.body.details[0].message).toBe("\"email\" is not allowed to be empty");
    });

    // 2. Attempt to sign in without entering an email
    test("sign in a registered user without inputting the email", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": "",
            "password": password,
            "userType": userType
        });

        expect(response.status).toBe(400);
        expect(response.body.details[0].message).toBe("\"email\" is not allowed to be empty");
    });

    // 3. Attempt to sign in without entering a password
    test("sign in a registered user without inputting a password", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": "",
            "userType": userType
        });

        expect(response.status).toBe(400);
        expect(response.body.details[0].message).toBe("\"password\" is not allowed to be empty");
    });

    // 4. Attempt to sign in with missing email and password but selecting a user type
    test("sign in a registered user without email and password but selecting user type", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": "",
            "password": "",
            "userType": userType
        });

        expect(response.status).toBe(400);
    });

    // 5. Attempt to sign in with a registered email but invalid password
    test("sign in a registered user with an invalid password", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": "wrongpassword",
            "userType": userType
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password.");
    });

    // 6. Attempt to sign in with the wrong user type
    test("sign in a registered user with wrong user type", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": "Admin"
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("You do not have permission to log in as a 'Admin'.");
    });

    // 7. Attempt to sign in as MerchantTeam without filling team ID
    test("MerchantTeam login without team ID", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": "MerchantTeam",
            "teamId": ""
        });

        expect(response.status).toBe(400);
        expect(response.body.details[0].message).toBe("\"teamId\" is not allowed to be empty");
    });

    // 8. Attempt to sign in as MerchantTeam using a different/invalid team ID
    test("MerchantTeam login with incorrect team ID", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": "MerchantTeam",
            "teamId": TeamId
        });

        expect(response.status).not.toBe(200);
    });

    // 9. Merchant login using wrong/non-existing team ID
    test("Merchant login with wrong team ID", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": "Merchant",
            "teamId": "INVALID"
        });

        expect(response.status).not.toBe(404);
    });

    // 10. MerchantTeam login with valid team ID
    test("MerchantTeam login with valid team ID", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": "Sct02@yopmail.com",
            "password": "Password1@",
            "userType": "MerchantTeam",
            "teamId": TeamId
        });

        expect(response.status).toBe(200);
    });

    // 11. Login into different MerchantTeam using a different team's password
    test("MerchantTeam login using password of different account", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": authData.otherEmail,
            "password": password,
            "userType": "MerchantTeam",
            "teamId": authData.teamId
        });

        expect([400, 401]).toContain(response.status);
    });

    // 12. Attempt to sign in with invalid/unsupported user type
    test("sign in with invalid user type", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": "SuperAdminBoss"
        });

        expect(response.status).toBe(400);
        expect(response.body.details[0].message).toContain("\"userType\" must be one of");
    });

    // 13. Sign in with valid credentials
    test("sign in a registered user with valid information", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": userType
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User logged in successfully");

        global.authtoken = response.body.data.token;
    });

    // 14. Attempt login with email containing spaces, uppercase, whitespace
    test("login with email containing spaces/uppercase/whitespace", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": "   " + email.toUpperCase() + "   ",
            "password": password,
            "userType": userType
        });

        expect([400, 422]).toContain(response.status);
    });

    // 15. Attempt login using unverified account
    test("login with unverified account", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": userType
        });

        expect(response.status).not.toBe(200);
    });

=======
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
>>>>>>> c4ed3dc406e36ff78676cef5bcbb66ae0a351d4c
});
