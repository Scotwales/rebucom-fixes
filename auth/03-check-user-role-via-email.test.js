/**
 * User Role Check Tests
 * Tests the role check endpoint with various scenarios
 *
 * Architecture:
 * ✅ Uses constants for STATUS codes and ENDPOINTS
 * ✅ Uses EmailGenerator for test data
 * ✅ Uses getAuthData for valid user email
 * ✅ No hardcoded values
 * ✅ Test independence
 */

const request = require('supertest');
const { STATUS, ENDPOINTS } = require('../test-data/constants');
const EmailGenerator = require('../test-data/EmailGenerator');
const getAuthData = require('../utilities/getAuthData');

const baseUrl = process.env.BASE_URL;

let authData;
let validUserEmail;

beforeAll(async () => {
  authData = await getAuthData();
  validUserEmail = authData.email;
});

describe('User Role Check API', () => {
  describe('Negative Test Cases', () => {
    test('should return 404 for non-existing user', async () => {
      // Generate a random email that definitely doesn't exist
      const nonExistentEmail = EmailGenerator.getRandomEmail('nonexistent');

      const response = await request(baseUrl)
        .post(ENDPOINTS.ROLES)
        .send({
          email: nonExistentEmail
        });

      expect(response.status).toBe(STATUS.NOT_FOUND);
      expect(response.body.message).toBe('User not found or does not exist');
    });

    test('should reject empty email', async () => {
      const response = await request(baseUrl)
        .post(ENDPOINTS.ROLES)
        .send({
          email: ''
        });

      expect(response.status).toBe(STATUS.BAD_REQUEST);
      expect(response.body.details[0].message).toBe('"email" is not allowed to be empty');
    });

    test('should handle email with leading/trailing spaces', async () => {
      const response = await request(baseUrl)
        .post(ENDPOINTS.ROLES)
        .send({
          email: '   ' + validUserEmail + '   '
        });

      // API should either trim and accept (200) or reject (400)
      expect([STATUS.OK, STATUS.BAD_REQUEST]).toContain(response.status);
    });

    test('should reject missing email field', async () => {
      const response = await request(baseUrl)
        .post(ENDPOINTS.ROLES)
        .send({});

      expect(response.status).toBe(STATUS.BAD_REQUEST);
      expect(response.body.message).toBe('Error in request body');
    });

    test('should reject invalid email format', async () => {
      const response = await request(baseUrl)
        .post(ENDPOINTS.ROLES)
        .send({
          email: 'not-a-valid-email'
        });

      expect(response.status).toBe(STATUS.BAD_REQUEST);
      expect(response.body.details).toBeDefined();
    });
  });

  describe('Positive Test Cases', () => {
    test('should successfully check role for valid user email', async () => {
      const response = await request(baseUrl)
        .post(ENDPOINTS.ROLES)
        .send({
          email: validUserEmail
        });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.message).toBe('User check successful');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.roles).toBeDefined();
    });
  });
});
