# Security Policy and Guidelines

This document outlines security practices, policies, and guidelines for the Rebucom API test suite.

## 🔒 Security Overview

This test suite was built with security as a priority, addressing critical issues identified in the initial audit:

- ✅ No credentials in version control
- ✅ Secure OTP handling strategies
- ✅ Security test coverage
- ✅ Rate limiting validation
- ✅ Input sanitization testing

## 🚨 Critical Security Issues Addressed

### Issue #1: Credentials in Version Control ✅ FIXED

**Problem**: Previously, credentials and tokens were stored in git.

**Solution**:
- All sensitive files excluded via `.gitignore`
- `.env` file never committed
- Template `.env.example` provided instead
- `TestDataFactory` generates dynamic test data

**Action Required**:
- ❌ NEVER commit `.env` files
- ❌ NEVER commit files containing tokens
- ✅ ALWAYS use `.env.example` as template
- ✅ ALWAYS rotate credentials if accidentally committed

### Issue #2: OTP Endpoint Security Risk ✅ ADDRESSED

**Problem**: `auth/view-Otp` endpoint could allow OTP bypass in production.

**Current Status**: ⚠️ **CRITICAL SECURITY CHECK REQUIRED**

**ACTION REQUIRED**:
1. **Immediately verify** that `auth/view-Otp` endpoint does NOT exist in production
2. If it exists in production, **remove it immediately**
3. Endpoint should ONLY exist in test environment with proper access controls

**Secure Testing Alternatives**:

```javascript
// Option 1: Use test endpoint (TEST ENVIRONMENT ONLY)
if (process.env.ALLOW_OTP_VIEW === 'true' && baseUrl.includes('test.')) {
  const otp = await authHelper.getOTPFromTestEndpoint(email);
}

// Option 2: Email service integration
const EmailOTPHelper = require('../utilities/EmailOTPHelper');
const otp = await EmailOTPHelper.getOTPFromYopmail(email);
```

### Issue #3: TLS Certificate Validation ⚠️ USE WITH CAUTION

**Problem**: Disabling TLS validation opens door to MITM attacks.

**Guidelines**:
- ✅ Enable TLS validation for production-like tests
- ⚠️ Only disable for local development/test environments
- ❌ NEVER disable in CI/CD for staging/production tests

**Configuration**:
```env
# .env - Only set this in controlled test environments
# NODE_TLS_REJECT_UNAUTHORIZED=0  # ⚠️ Security Risk!
```

## 🛡️ Security Best Practices

### 1. Secret Management

#### Environment Variables

**DO**:
- ✅ Store secrets in `.env` (excluded from git)
- ✅ Use different credentials for each environment
- ✅ Rotate credentials regularly
- ✅ Use `.env.example` as template

**DON'T**:
- ❌ Hardcode credentials in test files
- ❌ Commit `.env` to version control
- ❌ Share credentials in chat/email
- ❌ Reuse production credentials in tests

#### Credential Rotation

If credentials are compromised:

1. **Immediately** change the password
2. **Invalidate** all active tokens
3. **Review** git history for exposed secrets
4. **Consider** using `git-filter-repo` to remove from history
5. **Update** `.env` with new credentials
6. **Notify** security team if production credentials

### 2. Test Data Security

#### Using TestDataFactory

**DO**:
```javascript
// Generate fresh test data
const testUser = TestDataFactory.generateCustomer();
```

**DON'T**:
```javascript
// Hardcode test data
const testUser = {
  email: 'real.user@company.com',  // ❌ Real email
  password: 'ActualPassword123!'   // ❌ Real password
};
```

#### Disposable Email Addresses

Always use disposable email services for testing:

- ✅ `@yopmail.com`
- ✅ `@mailinator.com`
- ✅ `@temp-mail.org`
- ❌ Real email addresses
- ❌ Company email addresses

### 3. Token Security

#### Token Storage

**DO**:
- ✅ Store tokens in memory during test execution
- ✅ Clear tokens after test completion
- ✅ Use short-lived tokens for testing

**DON'T**:
- ❌ Store tokens in files tracked by git
- ❌ Log tokens to console in CI/CD
- ❌ Share tokens between test environments

#### Token Handling

```javascript
// ✅ GOOD: Token in memory
let authToken;
beforeAll(async () => {
  const response = await authHelper.createAuthenticatedUser(testUser);
  authToken = response.token;
});

afterAll(() => {
  authToken = null; // Clear token
});

// ❌ BAD: Token in file
fs.writeFileSync('token.json', JSON.stringify({ token }));
```

### 4. Input Validation Testing

The test suite includes security tests for:

#### SQL Injection Prevention

```javascript
test('should prevent SQL injection', async () => {
  const maliciousInput = "admin' OR '1'='1";
  const response = await authHelper.login(maliciousInput, 'password', 'Customer');

  expect(response.status).toBe(STATUS.BAD_REQUEST);
});
```

#### XSS Prevention

```javascript
test('should prevent XSS attacks', async () => {
  const xssPayload = '<script>alert("xss")</script>@test.com';
  const testUser = TestDataFactory.generateCustomer({ email: xssPayload });

  const response = await authHelper.signup(testUser);

  expect(response.status).toBe(STATUS.BAD_REQUEST);
});
```

#### Command Injection Prevention

```javascript
test('should prevent command injection', async () => {
  const cmdInjection = 'test@test.com; rm -rf /';
  const response = await authHelper.login(cmdInjection, 'password', 'Customer');

  expect(response.status).toBe(STATUS.BAD_REQUEST);
});
```

### 5. Rate Limiting Validation

Tests verify rate limiting is properly implemented:

```javascript
test('should enforce rate limiting', async () => {
  const requests = Array(10).fill(null).map(() =>
    authHelper.sendEmailOTP(email, 'signup')
  );

  const responses = await Promise.all(requests);
  const rateLimited = responses.filter(r => r.status === STATUS.TOO_MANY_REQUESTS);

  expect(rateLimited.length).toBeGreaterThan(0);
});
```

### 6. Authentication Security

#### Password Requirements

Tests validate strong password enforcement:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

```javascript
test('should enforce password complexity', async () => {
  const weakPassword = 'password';
  const testUser = TestDataFactory.generateCustomer({ password: weakPassword });

  const response = await authHelper.signup(testUser);

  expect(response.status).toBe(STATUS.BAD_REQUEST);
  expect(response.body.message).toMatch(/password/i);
});
```

#### User Enumeration Prevention

Error messages should not reveal whether user exists:

```javascript
// ✅ GOOD: Generic error
"Invalid email or password"

// ❌ BAD: Reveals user existence
"User does not exist"
"Incorrect password for user@test.com"
```

Test validates this:

```javascript
test('should not expose user existence', async () => {
  const response = await authHelper.login('nonexistent@test.com', 'pass', 'Customer');

  expect(response.status).toBe(STATUS.UNAUTHORIZED);
  expect(response.body.message).not.toMatch(/does not exist|not found/i);
  expect(response.body.message).toMatch(/invalid email or password/i);
});
```

## 🔐 OTP Security Guidelines

### OTP Generation Requirements

- Minimum 6 digits
- Cryptographically random
- Single-use only
- Time-limited (5-10 minutes)
- Rate-limited per user

### OTP Verification Requirements

- Constant-time comparison to prevent timing attacks
- Invalidate after successful verification
- Invalidate after expiry
- Invalidate after maximum failed attempts
- Log all verification attempts

### Testing OTP Securely

**Production Testing Strategy**:
1. Use email service API (e.g., Yopmail API)
2. Use SMS service webhooks
3. Manual verification for critical flows
4. Mock OTP service in unit tests

**Test Environment Strategy**:
1. View-OTP endpoint (TEST ONLY, with warnings)
2. Fixed test OTP for automated tests
3. Reduced expiry time for faster testing

## 🚧 Security Testing Checklist

When adding new tests, verify:

- [ ] No hardcoded credentials
- [ ] No real user data
- [ ] Input validation tested
- [ ] SQL injection prevention tested
- [ ] XSS prevention tested
- [ ] Rate limiting tested
- [ ] Authentication required where appropriate
- [ ] Authorization tested (user cannot access other users' data)
- [ ] Error messages don't leak sensitive information
- [ ] Tokens are properly validated

## 📋 Security Incident Response

### If Credentials Are Compromised

1. **Immediate Actions**:
   - Rotate all affected credentials
   - Invalidate active sessions/tokens
   - Notify security team

2. **Investigation**:
   - Review git history: `git log --all -- .env`
   - Check access logs
   - Identify scope of exposure

3. **Remediation**:
   - Update credentials in all environments
   - Remove from git history if needed:
     ```bash
     git filter-repo --path .env --invert-paths
     ```
   - Update documentation

4. **Prevention**:
   - Review `.gitignore`
   - Add pre-commit hooks
   - Team training on secure practices

### If Test Endpoint Is Exposed

1. **Immediate Actions**:
   - Disable endpoint in production
   - Check access logs for abuse
   - Notify security team

2. **Verification**:
   - Confirm endpoint only exists in test environment
   - Verify proper access controls
   - Test from external network

3. **Documentation**:
   - Update security documentation
   - Add monitoring/alerting
   - Train team on risks

## 📊 Security Audit History

| Date | Issue | Severity | Status |
|------|-------|----------|--------|
| Dec 2025 | Credentials in git | CRITICAL | ✅ FIXED |
| Dec 2025 | OTP endpoint risk | CRITICAL | ⚠️ REQUIRES VERIFICATION |
| Dec 2025 | TLS validation disabled | MEDIUM | ⚠️ DOCUMENTED |
| Dec 2025 | Weak assertions | MEDIUM | ✅ FIXED |
| Dec 2025 | Hardcoded test data | MEDIUM | ✅ FIXED |

## 🔍 Regular Security Reviews

### Monthly
- [ ] Review and rotate test credentials
- [ ] Check for new security vulnerabilities
- [ ] Update dependencies with security patches
- [ ] Review failed authentication attempts

### Quarterly
- [ ] Full security audit of test suite
- [ ] Review and update security policies
- [ ] Team security training
- [ ] Penetration testing of API

### Annually
- [ ] Comprehensive security assessment
- [ ] Update security documentation
- [ ] Review compliance requirements
- [ ] Third-party security audit

## 📞 Reporting Security Issues

### Internal Security Issues

For security concerns about the test suite:
1. Create a private issue (not public)
2. Tag with `security` label
3. Notify the team lead
4. Do not share details publicly

### API Security Issues

If you discover security vulnerabilities in the API:
1. **DO NOT** create a public issue
2. **DO NOT** share details publicly
3. **DO** report to security team immediately
4. **DO** provide detailed reproduction steps
5. **DO** include severity assessment

## ✅ Security Compliance

This test suite helps verify compliance with:

- **OWASP Top 10**: Tests for common vulnerabilities
- **GDPR**: No real user data in tests
- **PCI DSS**: No payment card data in tests
- **SOC 2**: Audit trail and access controls

## 📚 Security Resources

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Security Testing Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Testing_Cheat_Sheet.html)

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Owner**: Rebucom Security Team
