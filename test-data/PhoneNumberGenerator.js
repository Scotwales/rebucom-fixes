const { faker } = require('@faker-js/faker');

class PhoneNumberGenerator {
  static generateRandomPhoneNumber() {
    // Generate UK mobile phone number: 07XXXXXXXXX
    // Using faker with a template, then sanitizing to ensure only digits
    const phoneNumber = faker.phone.number('07#########');
    // Remove any non-digit characters that faker might add
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    // Ensure it's exactly 11 digits starting with 07
    if (cleanNumber.length >= 11 && cleanNumber.startsWith('07')) {
      return cleanNumber.substring(0, 11);
    }

    // Fallback: generate manually if faker output is invalid
    const prefix = '07';
    let number = '';
    for (let i = 0; i < 9; i++) {
      number += Math.floor(Math.random() * 10);
    }
    return prefix + number;
  }
}

module.exports = PhoneNumberGenerator;
