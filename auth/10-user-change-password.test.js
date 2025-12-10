const request = require("supertest");
const baseUrl = process.env.BASE_URL;
const getAuthData = require("../utilities/getAuthData.js");

let authData;
let userId;
let email;
let token;

const Password = "Password1@";
const WrongPassword = "WrongPassword@123";
const NewPassword = "Password@2";

beforeAll(async () => {
  authData = await getAuthData();
  userId = authData.userId;
  // token = authData.token;
  // console.log(token);
  // console.log(userId);
  // email = authData.email;
  // console.log(email);
});

describe("Test suite - Change Password", () => {

  test("Attempt to change password while unauthenticated", async () => {
    const response = await request(baseUrl)
      .post("auth/change-password")
      .send({
        userId: userId,
        oldPassword: Password,
        newPassword: NewPassword
      })
      .set("Authorization", "Bearer ");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });

  test("Attempt to change password using an invalid userID", async () => {
    const response = await request(baseUrl)
      .post("auth/change-password")
      .send({
        userId: "1234mm",
        oldPassword: Password,
        newPassword: NewPassword
      })
      .set("Authorization", `Bearer ${authData.token}`);

    expect(response.status).toBe(400);
    expect(response.body.details[0].message).toBe("\"userId\" must be a valid GUID");
  });

  test("Attempt to change password using an incorrect old password", async () => {
    const response = await request(baseUrl)
      .post("auth/change-password")
      .send({
        userId: userId,
        oldPassword: WrongPassword,
        newPassword: NewPassword
      })
      .set("Authorization", `Bearer ${authData.token}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("The old password you entered is incorrect.");
  });

  test("Attempt change with a new password that doesn't meet criteria", async () => {
    const response = await request(baseUrl)
      .post("auth/change-password")
      .send({
        userId: userId,
        oldPassword: Password,
        newPassword: "Password"
      })
      .set("Authorization", `Bearer ${authData.token}`);

    expect(response.status).toBe(400);
    expect(response.body.details[0].message)
      .toBe("Password must contain at least one uppercase letter, one lowercase letter, one number and one special character");
  });

  test("Submit old and new passwords that are identical", async () => {
    const response = await request(baseUrl)
      .post("auth/change-password")
      .send({
        userId: userId,
        oldPassword: Password,
        newPassword: Password
      })
      .set("Authorization", `Bearer ${authData.token}`);

    expect(response.status).not.toBe(200);
    expect(response.body.message).toBe("This password has been used recently. Please choose a different one.");
  });

  test("Change password with correct information ", async () => {
    const response = await request(baseUrl)
      .post("auth/change-password")
      .send({
        userId: userId,
        oldPassword: Password,
        newPassword: NewPassword
      })
      .set("Authorization", `Bearer ${authData.token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Password updated successfully");
  });
});
