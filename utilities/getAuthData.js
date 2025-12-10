const request = require("supertest");
const fs = require("fs");
const path = require("path");
const baseUrl = process.env.BASE_URL;

const FallbackPassword = process.env.PASSWORD; // backup password from .env

async function getAuthData() {
  const signupFilePath = path.join(__dirname, "../test-data/customerSignupData.json");

  if (!fs.existsSync(signupFilePath)) {
    throw new Error("❌ customerSignupData.json not found. Run signup test first.");
  }

  const signupData = JSON.parse(fs.readFileSync(signupFilePath, "utf8"));

  const email = signupData.email;
  const primaryPassword = signupData.password;
  const userType = signupData.userType || "Customer";

  // --------------------------
  // Helper login function
  // --------------------------
  async function login(password) {
    return await request(baseUrl)
      .post("auth/login")
      .send({
        email,
        password,
        userType
      });
  }

  // --------------------------
  // Attempt with primary password first
  // --------------------------
  let loginResponse = await login(primaryPassword);

  // --------------------------
  // If primary fails → try fallback password
  // --------------------------
  if (loginResponse.status !== 200) {
    console.warn(`⚠️ Primary password failed for ${email}. Trying fallback password...`);

    loginResponse = await login(FallbackPassword);
  }

  // --------------------------
  // If both fail → throw error
  // --------------------------
  if (loginResponse.status !== 200) {
    throw new Error(
      `❌ LOGIN FAILED (PRIMARY + FALLBACK)

Email: ${email}
UserType: ${userType}

Primary Password: ${primaryPassword}
Fallback Password: ${FallbackPassword}

API Response:
${loginResponse.text}
`
    );
  }

  // --------------------------
  // Validate final successful login
  // --------------------------
  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body.message).toBe("User logged in successfully");

  const user = loginResponse.body.data.user;
  const token = loginResponse.body.data.token;

  // --------------------------
  // Final mapped auth data
  // --------------------------
  const authData = {
    token,
    email: user.email,
    userId: user.userId,
    userType: user.userType,
    fullName: user.fullName,
    phone: user.phoneNumber,
    merchantId: user.merchant?.merchantId || null,
    customerId: user.customer?.customerId || null,
    driverId: user.driver?.driverId || null,
    teamId: user.merchantTeam?.teamId || null
  };

  // Save to CustomerAuthData.json
  const outputPath = path.join(__dirname, "./CustomerAuthData.json");
  fs.writeFileSync(outputPath, JSON.stringify(authData, null, 2), "utf8");

  return authData;
}

module.exports = getAuthData;
