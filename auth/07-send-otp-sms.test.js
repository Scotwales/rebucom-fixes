const request = require("supertest");
const baseUrl = process.env.BASE_URL;
const getAuthData = require("../utilities/getAuthData.js");

const OtpReason = "signup"; 

let authData;
let email;
let phoneNumber;

beforeAll(async () => {
  authData = await getAuthData();
  email = authData.email;
  phoneNumber = authData.phone;
});

describe("testcase for sending otp to user phone Number", () => {

  test("attempt to send OTP without entering an phone number", async () => {
    const response = await request(baseUrl)
      .post("auth/send-otp-sms")
      .send({
        phoneNumber: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message).toBe("\"phoneNumber\" is not allowed to be empty");
  });


  test("attempt to send OTP with wrong or non existing phone number ", async () => {
    const response = await request(baseUrl)
      .post("auth/send-otp-sms")
      .send({
        phoneNumber: "09011111111",
      });

    expect(response.status).not.toBe(201);
  });


  test("send OTP using valid user details", async () => {
    const response = await request(baseUrl)
      .post("auth/send-otp-sms")
      .send({
        phoneNumber: phoneNumber
      });

    expect(response.status).not.toBe([200,201]);
    expect(response.body.message).toMatch(/otp sent/i);
  });

  test("send OTP multiple times in a short period", async () => {
  // First attempt — should succeed
    await request(baseUrl)
        .post("auth/send-otp-sms")
        .send({
        phoneNumber: phoneNumber
        });

    // Second attempt immediately — expected to fail or be blocked
    const response = await request(baseUrl)
        .post("auth/send-otp-sms")
        .send({
        phoneNumber: phoneNumber
        });
    expect(response.status).not.toBe(201);
    });

});
