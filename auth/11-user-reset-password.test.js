const request = require("supertest");
const BaseUrl = process.env.BASE_URL;             
const getAuthData = require("../utilities/getAuthData.js");

const Password = "Password@1";                     
const WrongPassword = "WrongPassword@123";         
const WrongPhone = "07011234568";                  
const NewPassword = "Password@2";                  

let authData;
let email;
let userType;
let phone;

beforeAll(async () => {
  authData = await getAuthData();
  email = authData.email;
  userType = authData.userType;
  phone = authData.phone;
});

describe("resetPassword controller functional test", () => {

  test("attempt reset without entering email", async () => {
    const response = await request(BaseUrl)
      .post("auth/reset-password")    
      .send({
        newPassword: Password,
        email: ""
      });

    expect(response.status).not.toBe(200);
    expect(response.body.details[0].message)
      .toBe("\"email\" must be a valid email");
  });

  test("attempt reset without entering phone number", async () => {
    const response = await request(BaseUrl)
      .post("auth/reset-password")
      .send({
        newPassword: Password,
        phoneNumber: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message)
      .toBe("\"phoneNumber\" is not allowed to be empty");
  });

  test("attempt reset using phone number not linked to the account", async () => {
    const response = await request(BaseUrl)
      .post("auth/reset-password")
      .send({
        newPassword: Password,
        phoneNumber: WrongPhone
      });

    expect(response.status).toBe(404);
    expect(response.body.message)
      .toBe("User not found.");
  });

  // Uncomment after ensuring correct test data
  //
  // test("reset password with correct email and phone number", async () => {
  //   const response = await request(BaseUrl)
  //     .post("auth/reset-password")
  //     .send({
  //       newPassword: NewPassword,
  //       email: email,
  //       phoneNumber: phone
  //     });

  //   expect(response.status).toBe(200);
  //   expect(response.body.message).toBe("Password reset successful");
  // });

});
