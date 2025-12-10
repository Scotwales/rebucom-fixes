/**
 * Phone Number Generator for Test Data
 * Generates valid UK phone numbers for testing
 */

class PhoneNumberGenerator {
  /**
   * Generate a random UK mobile phone number
   * Format: 07XXXXXXXXX (11 digits)
   */
  static generateRandomPhoneNumber() {
    // UK mobile numbers start with 07
    const prefix = '07';

    // Generate 9 random digits
    let number = '';
    for (let i = 0; i < 9; i++) {
      number += Math.floor(Math.random() * 10);
    }

    return prefix + number;
  }

  /**
   * Generate a random landline number
   * Format: 01/02 + 9 digits
   */
  static generateLandlineNumber() {
    const prefixes = ['01', '02'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    let number = '';
    for (let i = 0; i < 9; i++) {
      number += Math.floor(Math.random() * 10);
    }

    return prefix + number;
  }

  /**
   * Generate an invalid phone number for negative testing
   */
  static generateInvalidPhoneNumber() {
    const invalidNumbers = [
      '070abc', // Contains letters
      '12345', // Too short
      '07', // Way too short
      '999999999999999', // Too long
      '00000000000', // All zeros
      '+44 7700 900000', // Contains spaces and +
      '07-700-900-000' // Contains hyphens
    ];
    return invalidNumbers[Math.floor(Math.random() * invalidNumbers.length)];
  }

  /**
   * Generate a phone number with specific area code
   */
  static generateWithAreaCode(areaCode) {
    let number = '';
    const remainingDigits = 11 - areaCode.length;

    for (let i = 0; i < remainingDigits; i++) {
      number += Math.floor(Math.random() * 10);
    }

    return areaCode + number;
  }

  /**
   * Validate UK phone number format
   */
  static isValidUKPhone(phone) {
    // Remove spaces and hyphens
    const cleaned = phone.replace(/[\s-]/g, '');

    // Must be 11 digits starting with 0
    return /^0[0-9]{10}$/.test(cleaned);
  }
}

module.exports = PhoneNumberGenerator;
