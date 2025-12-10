const { faker } = require('@faker-js/faker');

class EmailGenerator {
  static getRandomFirstName() {
    // ✅ FIX: Use simple names without special characters
    const name = faker.person.firstName();
    // Remove any special characters that might break
    return name.replace(/[^a-zA-Z]/g, '');
  }

  static getRandomLastName() {
    const name = faker.person.lastName();
    return name.replace(/[^a-zA-Z]/g, '');
  }

  static getRandomEmail(baseName) {
    const timestamp = Date.now();
    // ✅ FIX: Use much larger random number to prevent collisions
    const random = Math.floor(Math.random() * 1000000); // 1 million possibilities
    // Add microsecond precision using performance.now()
    const microseconds = Math.floor((performance.now() % 1) * 1000000);
    // Ensure baseName is clean
    const cleanName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanName}${timestamp}${random}${microseconds}@yopmail.com`;
  }
}

module.exports = EmailGenerator;
