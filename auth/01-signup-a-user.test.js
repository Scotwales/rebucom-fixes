const request = require("supertest");
const fs = require("fs");
const path = require("path");
const PhoneNumberGenerator = require("../test-data/PhoneNumberGenerator");
const EmailGenerator = require("../test-data/EmailGenerator");
const baseUrl = process.env.BASE_URL;

// CONSTANTS
const Password = "Password1@";

// FUNCTION VARIABLES
const fullName = EmailGenerator.getRandomFirstName() + EmailGenerator.getRandomLastName();
const username = EmailGenerator.getRandomFirstName();
const email = EmailGenerator.getRandomEmail(fullName);
const phoneNumber = PhoneNumberGenerator.generateRandomPhoneNumber();

describe("customer signup test suite", () => {

  test("submit the registration form with all fields empty", async () => {
    const response = await request(baseUrl)
      .post("auth/signup")
      .send({
        username: "",
        email: "",
        password: "",
        fullName: "",
        phoneNumber: ""
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Error in request body");
  });

  test("attempt registration without entering a username", async () => {
    const response = await request(baseUrl)
      .post("auth/signup")
      .send({
        username: "",
        email,
        password: Password,
        fullName,
        phoneNumber
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Error in request body");
  });

  test("attempt registration using an already registered email", async () => {
    const response = await request(baseUrl)
      .post("auth/signup")
      .send({
        username: fullName,
        email: "QA1@yopmail.com",
        password: Password,
        fullName,
        phoneNumber
      });

    expect(response.status).toBe(409);
    expect(response.body.message)
      .toBe("Customer with this email or phone already exists");
  });

  test("attempt registration without entering a mobile number", async () => {
    const response = await request(baseUrl)
      .post("auth/signup")
      .send({
        username: fullName,
        email,
        password: Password,
        fullName,
        phoneNumber: ""
      });

    expect(response.status).toBe(400);
  });

  test("attempt registration with invalid email format", async () => {
    const response = await request(baseUrl)
      .post("auth/signup")
      .send({
        username: fullName,
        email: "invalidEmailFormat",
        password: Password,
        fullName,
        phoneNumber
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message)
      .toBe("\"email\" must be a valid email");
  });

  test("attempt registration with invalid phone number format", async () => {
    const response = await request(baseUrl)
      .post("auth/signup")
      .send({
        username: fullName,
        email,
        password: Password,
        fullName,
        phoneNumber: "070abc"
      });

    expect(response.status).toBe(400);
    expect(response.body.message || response.body.details).toBeDefined();
  });

  test("attempt registration with password shorter than 8 characters", async () => {
    const response = await request(baseUrl)
      .post("auth/signup")
      .send({
        username: fullName,
        email,
        password: "Pass",
        fullName,
        phoneNumber
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message)
      .toBe("\"password\" length must be at least 8 characters long");
  });

  test("attempt registration with password missing a special character", async () => {
    const response = await request(baseUrl)
      .post("auth/signup")
      .send({
        username: fullName,
        email,
        password: "Password",
        fullName,
        phoneNumber
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message)
      .toBe("Password must contain at least one uppercase letter, one lowercase letter, one number and one special character");
  });

  test("attempt registration with password missing a digit", async () => {
    const response = await request(baseUrl)
      .post("auth/signup")
      .send({
        username: fullName,
        email,
        password: "Password@",
        fullName,
        phoneNumber
      });

    expect(response.status).toBe(400);
    expect(response.body.details[0].message)
      .toBe("Password must contain at least one uppercase letter, one lowercase letter, one number and one special character");
  });

  test("register using email with uppercase, whitespace or plus addressing", async () => {
    const plusEmail = " Test+1@" + email.split("@")[1];

    const response = await request(baseUrl)
      .post("auth/signup")
      .send({
        username,
        email: plusEmail,
        password: Password,
        fullName,
        phoneNumber
      });

    // API should either accept (200/201) or reject with validation error (400)
    expect([200, 201, 400]).toContain(response.status);
  });

  test("register with valid inputs", async () => {
    const response = await request(baseUrl)
      .post("auth/signup")
      .send({
        username,
        email,
        password: Password,
        fullName,
        phoneNumber
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");

    const createdUser = response.body.data.user.user;

    const storedData = {
      userId: createdUser.userId,
      systemId: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
      fullName: createdUser.fullName,
      phoneNumber: createdUser.phoneNumber,
      userType: createdUser.userType,
      accountType: createdUser.accountType,
      roles: createdUser.userRoles?.map(r => r.type) || [],
      password: Password,
      customerId: response.body.data.user.customer?.customerId || null
    };

    // ALWAYS SAVE CUSTOMER SIGNUP DATA
    const outputPath = path.join(__dirname, "../test-data/customerSignupData.json");

    fs.writeFileSync(outputPath, JSON.stringify(storedData, null, 2), "utf8");

    console.log(`customerSignupData.json saved successfully!`);
  });

});
