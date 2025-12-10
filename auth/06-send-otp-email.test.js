const request = require("supertest");
const baseUrl = process.env.BASE_URL;
const getAuthData = require("../utilities/getAuthData.js");

const OtpReason = "signup"; // constant in PascalCase

let authData;
let email;

beforeAll(async () => {
  authData = await getAuthData();
  email = authData.email;
});

describe("testcase for sending otp to user email", () => {

  test("attempt to send OTP without entering an email", async () => {
    const response = await request(baseUrl)
      .post("auth/send-otp-email")
      .send({
        email: "",
        verificationType: "signup"
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message).toBe("\"email\" is not allowed to be empty");
  });

  test("attempt to send OTP without selecting verification type", async () => {
    const response = await request(baseUrl)
      .post("auth/send-otp-email")
      .send({
        email: email,
        verificationType: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message).toBe("\"verificationType\" must be one of [signup, login, forgotPassword]");
  });

  test("send OTP using valid user details", async () => {
    const response = await request(baseUrl)
      .post("auth/send-otp-email")
      .send({
        email: email,
        verificationType: "signup"
      });

    expect([200, 201]).toContain(response.status);
    expect(response.body.message).toMatch(/otp sent/i);
  });

  test("send OTP multiple times in a short period", async () => {
    // First attempt
    await request(baseUrl)
      .post("auth/send-otp-email")
      .send({
        email: email,
        verificationType: "signup"
      });

    // Second attempt immediately — expected to rate-limit or throttle
    const response = await request(baseUrl)
      .post("auth/send-otp-email")
      .send({
        email: email,
        verificationType: "signup"
      });
    expect(response.status).not.toBe(201);
  });

});
