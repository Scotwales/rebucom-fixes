/**
 * Email OTP Helper
 * Provides secure methods to retrieve OTP for testing
 *
 * SECURITY NOTE:
 * This helper addresses the security concern identified in the audit report.
 * Instead of relying on a potentially insecure "view-Otp" endpoint,
 * this provides alternative strategies for OTP retrieval in tests.
 */

const axios = require('axios');

class EmailOTPHelper {
  /**
   * Retrieve OTP from Yopmail using their inbox API
   * Yopmail is a disposable email service commonly used for testing
   *
   * @param {string} email - Email address (must be @yopmail.com)
   * @param {number} maxAttempts - Maximum number of attempts to find OTP
   * @param {number} delayMs - Delay between attempts in milliseconds
   * @returns {Promise<string>} OTP code
   * @throws {Error} If OTP is not found or email is not from yopmail
   */
  static async getOTPFromYopmail(email, maxAttempts = 10, delayMs = 2000) {
    if (!email.includes('@yopmail.com')) {
      throw new Error(
        '❌ Email must be from yopmail.com to use this method. ' +
        `Got: ${email}`
      );
    }

    const username = email.split('@')[0];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`📧 Checking for OTP in ${email} (attempt ${attempt}/${maxAttempts})...`);

        // Yopmail API endpoint (unofficial - may change)
        // This is a simplified example - actual implementation may vary
        const response = await axios.get(
          `http://www.yopmail.com/en/inbox.php?login=${username}&p=1`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; TestBot/1.0)'
            },
            timeout: 5000
          }
        );

        // Parse email content for OTP pattern
        // OTP is typically 4-6 digits
        const otpPattern = /\b(\d{4,6})\b/g;
        const matches = response.data.match(otpPattern);

        if (matches && matches.length > 0) {
          // Return the first match (assuming it's the OTP)
          const otp = matches[0];
          console.log(`✅ OTP found: ${otp}`);
          return otp;
        }

        // Wait before retrying
        if (attempt < maxAttempts) {
          await this.sleep(delayMs);
        }
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);

        if (attempt < maxAttempts) {
          await this.sleep(delayMs);
        }
      }
    }

    throw new Error(
      `❌ OTP not found in email after ${maxAttempts} attempts. ` +
      'Email may not have arrived or OTP format is different than expected.'
    );
  }

  /**
   * Alternative: Use test endpoint if available (with security warnings)
   * This method should ONLY be used in test environments
   *
   * @param {Function} authHelper - AuthHelper instance with getOTPFromTestEndpoint method
   * @param {string} identifier - Email or phone identifier
   * @returns {Promise<string>} OTP code
   */
  static async getOTPFromTestEndpoint(authHelper, identifier) {
    console.warn(
      '⚠️  WARNING: Using test OTP endpoint. ' +
      'This endpoint should NOT exist in production!'
    );

    return await authHelper.getOTPFromTestEndpoint(identifier);
  }

  /**
   * Strategy: Manual OTP entry (for local development)
   * This requires manual intervention but is secure
   *
   * @param {string} email - Email address
   * @returns {Promise<string>} OTP entered by user
   */
  static async promptForManualOTP(email) {
    console.log('\n' + '='.repeat(60));
    console.log(`📧 Please check email: ${email}`);
    console.log('Enter the OTP code when received:');
    console.log('='.repeat(60) + '\n');

    // In a real implementation, you would use readline or similar
    // For automated tests, this is not practical
    throw new Error(
      'Manual OTP entry not implemented. ' +
      'Use getOTPFromYopmail() or getOTPFromTestEndpoint() instead.'
    );
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Extract OTP from email HTML content
   * @param {string} htmlContent - Email HTML content
   * @returns {string|null} OTP if found, null otherwise
   */
  static extractOTPFromHTML(htmlContent) {
    // Common patterns for OTP in emails
    const patterns = [
      /Your OTP is:?\s*(\d{4,6})/i,
      /OTP:?\s*(\d{4,6})/i,
      /verification code:?\s*(\d{4,6})/i,
      /code:?\s*(\d{4,6})/i,
      /<strong>(\d{4,6})<\/strong>/i,
      /<b>(\d{4,6})<\/b>/i
    ];

    for (const pattern of patterns) {
      const match = htmlContent.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}

module.exports = EmailOTPHelper;
