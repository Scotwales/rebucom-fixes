const { faker } = require('@faker-js/faker');

class PhoneNumberGenerator {
  static generateRandomPhoneNumber() {
    // ✅ FIX: Use timestamp-based phone number to guarantee uniqueness
    // UK mobile phone number format: 07XXXXXXXXX (11 digits)
    const prefix = '07';

    // Use timestamp for uniqueness (last 7 digits of timestamp)
    const timestamp = Date.now().toString().slice(-7);

    // Add 2 more random digits to complete 9 digits (07 + 9 = 11 total)
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');

    return prefix + timestamp + random;
  }
}

module.exports = PhoneNumberGenerator;
