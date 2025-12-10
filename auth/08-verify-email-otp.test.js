const request = require("supertest");
const baseUrl = process.env.BASE_URL;
const getAuthData = require("../utilities/getAuthData.js");

let authData;
let email;

beforeAll(async () => {
  authData = await getAuthData();
  email = authData.email;
});

describe("testcase for sending otp to user email", () => {

  test("attempt to verify OTP without entering an email", async () => {
    const response = await request(baseUrl)
      .post("auth/verify-email")
      .send({
        email: "",
        otp: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message).toBe("\"email\" is not allowed to be empty");
  });

  test("attempt to verify OTP without inputting OTP", async () => {
    const response = await request(baseUrl)
      .post("auth/verify-email")
      .send({
        email: email,
        otp: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message).toBe("\"otp\" is not allowed to be empty");
  });

  test("Request OTP and verify user email", async () => {
    const response = await request(baseUrl)
      .post("auth/send-otp-email")
      .send({
        email: email,
        verificationType: "signup"
      });

    expect([200, 201]).toContain(response.status);
    expect(response.body.message).toMatch(/otp sent/i);

    // view sent otp
    const ViewOTPResponse = await request(baseUrl)
     .post("auth/view-Otp")
      .send({
       identifier: email
      });
      const OTP = ViewOTPResponse.body.data;

    const VerifyEmailResponse = await request(baseUrl)
     .post("auth/verify-email")
      .send({
        email: email,
        otp: OTP
      });
      expect(VerifyEmailResponse.status).toBe(200);
      expect(VerifyEmailResponse.body.message).toBe("OTP Verification was successful")

  });


});
