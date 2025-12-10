/**
 * Test Data Factory
 * Centralized factory for generating test data
 * Eliminates hardcoded test data and makes tests portable
 */

const EmailGenerator = require('./EmailGenerator');
const PhoneNumberGenerator = require('./PhoneNumberGenerator');
const { USER_TYPES, PASSWORDS } = require('./constants');

class TestDataFactory {
  /**
   * Generate a random customer user
   * @param {Object} overrides - Optional field overrides
   * @returns {Object} Customer user data
   */
  static generateCustomer(overrides = {}) {
    const firstName = EmailGenerator.getRandomFirstName();
    const lastName = EmailGenerator.getRandomLastName();

    return {
      username: overrides.username || firstName.toLowerCase(),
      email: overrides.email || EmailGenerator.getRandomEmail(firstName),
      password: overrides.password || PASSWORDS.VALID,
      fullName: overrides.fullName || `${firstName} ${lastName}`,
      phoneNumber: overrides.phoneNumber || PhoneNumberGenerator.generateRandomPhoneNumber(),
      userType: USER_TYPES.CUSTOMER,
      ...overrides
    };
  }

  /**
   * Generate a merchant user
   * @param {Object} overrides - Optional field overrides
   * @returns {Object} Merchant user data
   */
  static generateMerchant(overrides = {}) {
    const customer = this.generateCustomer(overrides);
    return {
      ...customer,
      userType: USER_TYPES.MERCHANT,
      businessName: overrides.businessName || `${customer.fullName}'s Business`
    };
  }

  /**
   * Generate a driver user
   * @param {Object} overrides - Optional field overrides
   * @returns {Object} Driver user data
   */
  static generateDriver(overrides = {}) {
    const customer = this.generateCustomer(overrides);
    return {
      ...customer,
      userType: USER_TYPES.DRIVER,
      vehicleNumber: overrides.vehicleNumber || this.generateVehicleNumber()
    };
  }

  /**
   * Generate a merchant team member
   * @param {Object} overrides - Optional field overrides
   * @returns {Object} Merchant team user data
   */
  static generateMerchantTeam(overrides = {}) {
    const customer = this.generateCustomer(overrides);
    return {
      ...customer,
      userType: USER_TYPES.MERCHANT_TEAM,
      teamId: overrides.teamId || this.getTestTeamIds().teamOne
    };
  }

  /**
   * Get test team IDs from environment
   * @returns {Object} Team IDs
   */
  static getTestTeamIds() {
    return {
      teamOne: process.env.TEST_TEAM_ONE_ID || '9246583f-96c7-4f06-94a9-da5cdc87ef99',
      teamTwo: process.env.TEST_TEAM_TWO_ID || '6faf4c2e-56be-43c1-889c-3fdaa9278638'
    };
  }

  /**
   * Get pre-existing test accounts (for multi-role scenarios)
   * @returns {Object} Test accounts
   */
  static getTestAccounts() {
    return {
      multiRoleUser: {
        email: process.env.TEST_MULTI_ROLE_EMAIL || 'sct02@yopmail.com',
        password: process.env.TEST_MULTI_ROLE_PASSWORD || PASSWORDS.VALID
      },
      existingUser: {
        email: process.env.EMAIL || 'b112@yopmail.com',
        password: process.env.PASSWORD || PASSWORDS.VALID_ALT
      }
    };
  }

  /**
   * Generate user with invalid email
   * @returns {Object} User data with invalid email
   */
  static generateUserWithInvalidEmail() {
    const user = this.generateCustomer();
    return {
      ...user,
      email: EmailGenerator.getInvalidEmail()
    };
  }

  /**
   * Generate user with invalid phone
   * @returns {Object} User data with invalid phone
   */
  static generateUserWithInvalidPhone() {
    const user = this.generateCustomer();
    return {
      ...user,
      phoneNumber: PhoneNumberGenerator.generateInvalidPhoneNumber()
    };
  }

  /**
   * Generate user with weak password
   * @param {string} passwordType - Type of weak password (noSpecial, noNumber, tooShort, etc.)
   * @returns {Object} User data with weak password
   */
  static generateUserWithWeakPassword(passwordType = 'noSpecial') {
    const user = this.generateCustomer();
    const weakPasswords = {
      tooShort: PASSWORDS.TOO_SHORT,
      noSpecial: PASSWORDS.NO_SPECIAL,
      noNumber: PASSWORDS.NO_NUMBER,
      noUppercase: PASSWORDS.NO_UPPERCASE,
      empty: PASSWORDS.EMPTY
    };

    return {
      ...user,
      password: weakPasswords[passwordType] || PASSWORDS.NO_SPECIAL
    };
  }

  /**
   * Generate invalid data for negative testing
   * @returns {Object} Various invalid data patterns
   */
  static getInvalidData() {
    return {
      email: EmailGenerator.getInvalidEmail(),
      phone: PhoneNumberGenerator.generateInvalidPhoneNumber(),
      weakPasswords: {
        tooShort: PASSWORDS.TOO_SHORT,
        noSpecial: PASSWORDS.NO_SPECIAL,
        noNumber: PASSWORDS.NO_NUMBER,
        noUppercase: PASSWORDS.NO_UPPERCASE
      },
      emptyString: '',
      null: null,
      undefined: undefined,
      specialChars: '<script>alert("xss")</script>',
      sqlInjection: "' OR '1'='1",
      longString: 'a'.repeat(1000)
    };
  }

  /**
   * Generate a UK vehicle registration number
   * @returns {string} Vehicle number (e.g., AB12 CDE)
   */
  static generateVehicleNumber() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const getRandomLetter = () => letters[Math.floor(Math.random() * letters.length)];
    const getRandomDigit = () => Math.floor(Math.random() * 10);

    // UK format: AB12 CDE
    return `${getRandomLetter()}${getRandomLetter()}${getRandomDigit()}${getRandomDigit()} ${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}`;
  }

  /**
   * Generate boundary test data
   * @returns {Object} Boundary values for testing
   */
  static getBoundaryData() {
    return {
      minUsername: 'abc',
      maxUsername: 'a'.repeat(50),
      tooLongUsername: 'a'.repeat(51),
      minPassword: 'Pass1@78',
      maxPassword: 'P@ss1' + 'a'.repeat(123),
      tooLongPassword: 'P@ss1' + 'a'.repeat(124),
      maxEmail: 'a'.repeat(240) + '@example.com',
      tooLongEmail: 'a'.repeat(250) + '@example.com'
    };
  }

  /**
   * Generate a batch of users for load testing
   * @param {number} count - Number of users to generate
   * @param {string} userType - Type of user (Customer, Merchant, Driver)
   * @returns {Array} Array of user objects
   */
  static generateBatch(count = 10, userType = USER_TYPES.CUSTOMER) {
    const users = [];
    for (let i = 0; i < count; i++) {
      switch (userType) {
        case USER_TYPES.MERCHANT:
          users.push(this.generateMerchant());
          break;
        case USER_TYPES.DRIVER:
          users.push(this.generateDriver());
          break;
        default:
          users.push(this.generateCustomer());
      }
    }
    return users;
  }
}

module.exports = TestDataFactory;
