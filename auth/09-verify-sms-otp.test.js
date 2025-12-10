const request = require("supertest");
const baseUrl = process.env.BASE_URL;
const getAuthData = require("../utilities/getAuthData.js");

let authData;
let email;
let phone;

beforeAll(async () => {
  authData = await getAuthData();
  email = authData.email;
  phone = authData.phone;
});

describe("testcase for verifying user phone number", () => {

  test("attempt to verify OTP without entering an phone number", async () => {
    const response = await request(baseUrl)
      .post("auth/verify-phone")
      .send({
        phoneNumber: "",
        code: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message).toBe("\"phoneNumber\" is not allowed to be empty");
  });

  test("attempt to verify code without inputting code", async () => {
    const response = await request(baseUrl)
      .post("auth/verify-phone")
      .send({
        phoneNumber: phone,
        code: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message).toBe("\"code\" is not allowed to be empty");
  });

  test("Request code and verify user phone", async () => {
    const response = await request(baseUrl)
      .post("auth/send-otp-sms")
      .send({
        phoneNumber: phone
        
      });

    expect([200, 201]).toContain(response.status);
    expect(response.body.message).toMatch(/otp sent/i);

    // view sent otp
    const ViewOTPResponse = await request(baseUrl)
     .post("auth/view-Otp")
      .send({
       identifier: phone
      });
      const Code = ViewOTPResponse.body.data;

    const VerifyPhoneResponse = await request(baseUrl)
     .post("auth/verify-phone")
      .send({
        phoneNumber: phone,
        code: Code
      });
      expect(VerifyPhoneResponse.status).toBe(200);
      expect(VerifyPhoneResponse.body.message).toBe("OTP Verification was successful")

  });


});
