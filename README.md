# Rebucom Backend API Test Suite

Automated API tests for Rebucom authentication and user management endpoints, built with best practices and security in mind.

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](.)
[![Security](https://img.shields.io/badge/security-hardened-blue)](./SECURITY.md)
[![License](https://img.shields.io/badge/license-ISC-green)](.)

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Configuration](#configuration)
- [Writing Tests](#writing-tests)
- [Test Data Management](#test-data-management)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [CI/CD Integration](#cicd-integration)
- [Contributing](#contributing)

## ✨ Features

- ✅ **Secure by Design**: No credentials in version control, proper secret management
- ✅ **Independent Tests**: Each test creates its own data, no cross-test dependencies
- ✅ **Maintainable**: Uses factory patterns, helpers, and constants for DRY code
- ✅ **Comprehensive Coverage**: Positive, negative, security, and performance tests
- ✅ **Clear Reporting**: HTML reports with detailed test results
- ✅ **Best Practices**: Follows industry standards for API testing

## 📋 Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- Access to Rebucom test environment

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RebucomTest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your test environment URL
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **View test report**
   - Open `./reports/test-report.html` in your browser

## 📁 Project Structure

```
RebucomTest/
├── auth/                           # Authentication test suites
│   ├── 01-signup-a-user.test.js   # User registration tests
│   ├── 02-login.test.js           # Login authentication tests
│   └── 03-otp-verification.test.js # OTP verification tests
│
├── test-data/                      # Test data and utilities
│   ├── TestDataFactory.js         # Factory for generating test data
│   ├── constants.js               # Shared constants (status codes, etc.)
│   ├── EmailGenerator.js          # Email generation utility
│   └── PhoneNumberGenerator.js    # Phone number generation utility
│
├── utilities/                      # Helper utilities
│   ├── AuthHelper.js              # Authentication helper methods
│   └── EmailOTPHelper.js          # OTP retrieval utilities
│
├── reports/                        # Generated test reports (not in git)
│   ├── test-report.html           # HTML test report
│   └── coverage/                  # Coverage reports
│
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies and scripts
├── jest.setup.js                  # Jest configuration
├── babel.config.js                # Babel configuration
├── README.md                      # This file
└── SECURITY.md                    # Security guidelines
```

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# Signup tests
npm run test:signup

# Login tests
npm run test:login

# OTP tests
npm run test:otp

# Password tests
npm run test:password

# Role tests
npm run test:role
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Debug Tests
```bash
npm run test:debug
```

### Clean Generated Files
```bash
npm run clean
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required: API Base URL
BASE_URL=https://test.rebucom.com/api/v1/

# Optional: Pre-existing test accounts (for multi-role tests)
TEST_MULTI_ROLE_EMAIL=test@yopmail.com
TEST_MULTI_ROLE_PASSWORD=Password1@
TEST_TEAM_ONE_ID=team-id-1
TEST_TEAM_TWO_ID=team-id-2
```

### Test Configuration

Edit `package.json` to modify Jest configuration:

- **Timeout**: Default is 30 seconds per test
- **Workers**: Tests run sequentially (maxWorkers: 1) to avoid conflicts
- **Reports**: HTML reports generated in `./reports/`

## 📝 Writing Tests

### Using TestDataFactory

Always use `TestDataFactory` to generate test data:

```javascript
const TestDataFactory = require('../test-data/TestDataFactory');

// Generate a customer
const customer = TestDataFactory.generateCustomer();

// Generate with overrides
const merchant = TestDataFactory.generateMerchant({
  email: 'specific@email.com',
  password: 'CustomPass1@'
});

// Generate invalid data for negative tests
const invalidUser = TestDataFactory.generateUserWithInvalidEmail();
```

### Using AuthHelper

Use `AuthHelper` for all authentication operations:

```javascript
const AuthHelper = require('../utilities/AuthHelper');
const baseUrl = process.env.BASE_URL;
const authHelper = new AuthHelper(baseUrl);

// Create authenticated user (signup + login)
const userData = await authHelper.createAuthenticatedUser(testUser);

// Login
const response = await authHelper.login(email, password, userType);

// Send OTP
await authHelper.sendEmailOTP(email, verificationType);

// Verify OTP
await authHelper.verifyEmailOTP(email, otp);
```

### Using Constants

Import and use constants for better maintainability:

```javascript
const { STATUS, PASSWORDS, USER_TYPES, ENDPOINTS } = require('../test-data/constants');

// Use status codes
expect(response.status).toBe(STATUS.OK);

// Use user types
const user = TestDataFactory.generateCustomer({ userType: USER_TYPES.MERCHANT });

// Use passwords
const weakPass = PASSWORDS.NO_SPECIAL;
```

### Test Structure Best Practices

```javascript
describe('Feature Name', () => {
  let testUser;

  // Setup: Create test data before tests
  beforeAll(async () => {
    testUser = TestDataFactory.generateCustomer();
    await authHelper.createAuthenticatedUser(testUser);
  });

  describe('Positive Test Cases', () => {
    test('should successfully perform action', async () => {
      // Arrange
      const data = { /* test data */ };

      // Act
      const response = await makeRequest(data);

      // Assert
      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Negative Test Cases', () => {
    test('should reject invalid input', async () => {
      const invalidData = TestDataFactory.getInvalidData();

      const response = await makeRequest(invalidData);

      expect(response.status).toBe(STATUS.BAD_REQUEST);
      expect(response.body.message).toMatch(/error pattern/i);
    });
  });
});
```

### Assertion Best Practices

✅ **DO** - Use specific assertions:
```javascript
expect(response.status).toBe(STATUS.OK);
expect(response.body.message).toBe('User logged in successfully');
```

❌ **DON'T** - Use weak assertions:
```javascript
expect(response.status).not.toBe(500);  // Too vague!
expect(response.status).not.toBe(200);  // Could be any error!
```

## 🎯 Test Data Management

### Independent Test Data

Each test should create its own data:

```javascript
test('my test', async () => {
  // Create fresh data for this test
  const testUser = TestDataFactory.generateCustomer();

  // Use it in the test
  const response = await authHelper.signup(testUser);

  expect(response.status).toBe(STATUS.CREATED);
});
```

### Shared Test Data

For tests that need shared setup, use `beforeAll`:

```javascript
describe('Login Tests', () => {
  let sharedUser;

  beforeAll(async () => {
    // Create once, use in all tests
    sharedUser = TestDataFactory.generateCustomer();
    await authHelper.createAuthenticatedUser(sharedUser);
  });

  test('can login', async () => {
    // Use sharedUser
  });

  test('can logout', async () => {
    // Use sharedUser
  });
});
```

### Test Data Cleanup

Tests create data but don't clean up by default. To clean up:

```javascript
afterAll(async () => {
  // Optional: Delete test user if API supports it
  if (testUserId && deleteUserEndpoint) {
    await deleteUser(testUserId);
  }
});
```

## 🔒 Security Best Practices

### ⚠️ CRITICAL: Never Commit Secrets

- ❌ Never commit `.env` files
- ❌ Never commit files with tokens or credentials
- ❌ Never hardcode passwords in test files
- ✅ Always use `.env.example` as a template
- ✅ Always use `TestDataFactory` for test data

### OTP Security

**IMPORTANT**: The audit report identified a critical security risk with the `auth/view-Otp` endpoint.

**If this endpoint exists in production, it MUST be removed immediately.**

For testing, use one of these secure alternatives:

1. **Test Endpoint (Test Environment Only)**
   ```javascript
   // Only works if ALLOW_OTP_VIEW=true in .env
   const otp = await authHelper.getOTPFromTestEndpoint(email);
   ```

2. **Email Service Integration**
   ```javascript
   const EmailOTPHelper = require('../utilities/EmailOTPHelper');
   const otp = await EmailOTPHelper.getOTPFromYopmail(email);
   ```

3. **Manual Entry (Development)**
   - Check email manually
   - Enter OTP when prompted

### TLS/SSL Certificate Validation

**DO NOT** disable TLS validation except in controlled test environments:

```env
# .env - Only for test environments!
NODE_TLS_REJECT_UNAUTHORIZED=0  # ⚠️ Security Risk!
```

For production-like testing, use proper certificates.

### Security Testing

The test suite includes security tests:

- SQL Injection prevention
- XSS attack prevention
- User enumeration prevention
- Rate limiting validation
- Password strength enforcement

See `SECURITY.md` for detailed security guidelines.

## 🔧 Troubleshooting

### Tests Fail: "BASE_URL is not defined"

**Solution**: Create `.env` file from template
```bash
cp .env.example .env
# Edit .env and set BASE_URL
```

### Tests Fail: "Cannot find module"

**Solution**: Install dependencies
```bash
npm install
```

### OTP Tests Fail

**Causes**:
- OTP expired (usually 5-10 minutes)
- Email delivery delay
- Test endpoint not available

**Solutions**:
1. Check if test endpoint is enabled
2. Verify email service is working
3. Check OTP expiry time settings

### Network/Connection Errors

**Causes**:
- Test environment down
- Network connectivity issues
- Firewall blocking requests

**Solutions**:
1. Verify BASE_URL is correct
2. Check network connectivity
3. Verify test environment is running

### Tests Pass Locally But Fail in CI

**Common Issues**:
- Environment variables not set in CI
- Different Node.js version
- Timing issues (increase timeouts)

**Solutions**:
1. Set secrets in CI environment
2. Match Node.js versions
3. Increase test timeout in CI

## 🤖 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/api-tests.yml`:

```yaml
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      env:
        BASE_URL: ${{ secrets.TEST_BASE_URL }}
        TEST_TEAM_ONE_ID: ${{ secrets.TEST_TEAM_ONE_ID }}
        TEST_TEAM_TWO_ID: ${{ secrets.TEST_TEAM_TWO_ID }}
      run: npm test

    - name: Upload test report
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-reports
        path: reports/

    - name: Upload coverage
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: coverage-report
        path: reports/coverage/
```

### GitLab CI Example

Create `.gitlab-ci.yml`:

```yaml
test:
  image: node:18
  stage: test
  script:
    - npm install
    - npm test
  variables:
    BASE_URL: $TEST_BASE_URL
  artifacts:
    when: always
    paths:
      - reports/
    expire_in: 1 week
```

## 🤝 Contributing

### Adding New Tests

1. Create test file in `auth/` directory
2. Use `TestDataFactory` for test data
3. Use `AuthHelper` for authentication
4. Follow naming conventions (camelCase for variables)
5. Write clear test descriptions
6. Include positive AND negative test cases

### Code Style

- Use **camelCase** for variables and functions
- Use **UPPER_CASE** for constants
- Use **PascalCase** for classes
- Add JSDoc comments for functions
- Keep functions focused and small

### Pull Request Process

1. Write tests for new functionality
2. Ensure all tests pass locally
3. Update documentation if needed
4. Create pull request with clear description
5. Address review feedback

## 📊 Test Coverage Goals

- ✅ **Line Coverage**: > 80%
- ✅ **Branch Coverage**: > 75%
- ✅ **Function Coverage**: > 80%
- ✅ **Positive Tests**: All critical paths
- ✅ **Negative Tests**: All validation rules
- ✅ **Security Tests**: All OWASP Top 10

## 📞 Support

For questions or issues:

- **Create an issue**: [GitHub Issues](../../issues)
- **Security concerns**: See [SECURITY.md](./SECURITY.md)
- **Documentation**: Check this README and inline code comments

## 📄 License

ISC License - See LICENSE file for details

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Maintainer**: Rebucom QA Team
