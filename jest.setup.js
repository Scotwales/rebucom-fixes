/**
 * Jest Setup File
 * Runs before all tests
 */

require('dotenv').config();

// Ensure required environment variables are set
if (!process.env.BASE_URL) {
  throw new Error(
    '❌ BASE_URL is not defined in .env file. Please copy .env.example to .env and configure it.'
  );
}

// Set reasonable timeout for API tests
jest.setTimeout(30000);

// Global test utilities can be added here if needed
