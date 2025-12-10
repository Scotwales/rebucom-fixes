<<<<<<< HEAD
const { faker } = require('@faker-js/faker');

class EmailGenerator {
  static getRandomFirstName() {
    return faker.person.firstName(); // Use person instead of name
  }

  static getRandomLastName() {
    return faker.person.lastName(); // Use person instead of name
  }

  static getRandomEmail(firstName) {
    const randomNumber = Math.floor(Math.random() * 99999) + 1;
    const emailDomain = '@yopmail.com';
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, '');
    return `${cleanFirstName}${randomNumber}${emailDomain}`;
  }
}

module.exports = EmailGenerator;
=======
/**
 * Email Generator for Test Data
 * Generates unique, disposable email addresses for testing
 */

class EmailGenerator {
  static firstNames = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
    'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul',
    'Quinn', 'Rose', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xander',
    'Yara', 'Zoe'
  ];

  static lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson',
    'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'
  ];

  /**
   * Get a random first name
   */
  static getRandomFirstName() {
    return this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
  }

  /**
   * Get a random last name
   */
  static getRandomLastName() {
    return this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
  }

  /**
   * Generate a random email using yopmail.com (disposable email service)
   * Format: {firstName}{randomNumber}@yopmail.com
   */
  static getRandomEmail(firstName = null) {
    const name = firstName || this.getRandomFirstName();
    const randomNum = Math.floor(Math.random() * 10000);
    const timestamp = Date.now().toString().slice(-4);
    return `${name.toLowerCase()}${randomNum}${timestamp}@yopmail.com`;
  }

  /**
   * Generate a unique email with custom prefix
   */
  static generateEmail(prefix) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}${random}@yopmail.com`;
  }

  /**
   * Generate an invalid email for negative testing
   */
  static getInvalidEmail() {
    const invalidEmails = [
      'invalid-email',
      'missing-at-sign.com',
      '@no-local-part.com',
      'no-domain@',
      'spaces in@email.com',
      'double@@at.com',
      'invalid..dots@email.com'
    ];
    return invalidEmails[Math.floor(Math.random() * invalidEmails.length)];
  }

  /**
   * Generate a full name from first and last name
   */
  static getRandomFullName() {
    return `${this.getRandomFirstName()} ${this.getRandomLastName()}`;
  }
}

module.exports = EmailGenerator;
>>>>>>> c4ed3dc406e36ff78676cef5bcbb66ae0a351d4c
