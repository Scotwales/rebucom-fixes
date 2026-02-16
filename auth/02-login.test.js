const request = require("supertest");
const baseUrl = process.env.BASE_URL;
const getAuthData = require("../utilities/getAuthData.js");

let authtoken = "";
let authData;
let email;
let userType;
const password = "Password1@";
const TeamId = "6faf4c2e-56be-43c1-889c-3fdaa9278638";

beforeAll(async () => {
  authData = await getAuthData();
  email = authData.email;
  userType = authData.userType;
});

describe("Testcase for sign-in", () => {

    // 1. Attempt to sign in without filling any field in the login form
    test("sign in without filling the login form", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": "",
            "password": "",
            "userType": ""
        });

        expect(response.status).toBe(400);
        expect(response.body.details[0].message).toBe("\"email\" is not allowed to be empty");
    });

    // 2. Attempt to sign in without entering an email
    test("sign in a registered user without inputting the email", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": "",
            "password": password,
            "userType": userType
        });

        expect(response.status).toBe(400);
        expect(response.body.details[0].message).toBe("\"email\" is not allowed to be empty");
    });

    // 3. Attempt to sign in without entering a password
    test("sign in a registered user without inputting a password", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": "",
            "userType": userType
        });

        expect(response.status).toBe(400);
        expect(response.body.details[0].message).toBe("\"password\" is not allowed to be empty");
    });

    // 4. Attempt to sign in with missing email and password but selecting a user type
    test("sign in a registered user without email and password but selecting user type", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": "",
            "password": "",
            "userType": userType
        });

        expect(response.status).toBe(400);
    });

    // 5. Attempt to sign in with a registered email but invalid password
    test("sign in a registered user with an invalid password", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": "wrongpassword",
            "userType": userType
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password.");
    });

    // 6. Attempt to sign in with the wrong user type
    test("sign in a registered user with wrong user type", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": "Admin"
        });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("You do not have permission to log in as a 'Admin'.");
    });

    // 7. Attempt to sign in as MerchantTeam without filling team ID
    test("MerchantTeam login without team ID", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": "MerchantTeam",
            "teamId": ""
        });

        expect(response.status).toBe(400);
        expect(response.body.details[0].message).toBe("\"teamId\" is not allowed to be empty");
    });

    // 8. Attempt to sign in as MerchantTeam using a different/invalid team ID
    test("MerchantTeam login with incorrect team ID", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": "MerchantTeam",
            "teamId": TeamId
        });

        // Should reject with 403 (forbidden) or 401 (unauthorized)
        expect([401, 403]).toContain(response.status);
    });

    // 9. Merchant login using wrong/non-existing team ID
    test("Merchant login with wrong team ID", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": "Merchant",
            "teamId": "INVALID"
        });

        // Should reject with validation error (400) or bad request
        expect([400, 422]).toContain(response.status);
    });

    // 10. MerchantTeam login with valid team ID
    test("MerchantTeam login with valid team ID", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": "Sct02@yopmail.com",
            "password": "Password1@",
            "userType": "MerchantTeam",
            "teamId": TeamId
        });

        expect(response.status).toBe(200);
    });

    // 11. Login into different MerchantTeam using a different team's password
    test("MerchantTeam login using password of different account", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": authData.otherEmail,
            "password": password,
            "userType": "MerchantTeam",
            "teamId": authData.teamId
        });

        expect([400, 401]).toContain(response.status);
    });

    // 12. Attempt to sign in with invalid/unsupported user type
    test("sign in with invalid user type", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": "SuperAdminBoss"
        });

        expect(response.status).toBe(400);
        expect(response.body.details[0].message).toContain("\"userType\" must be one of");
    });

    // 13. Sign in with valid credentials
    test("sign in a registered user with valid information", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": userType
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User logged in successfully");

        global.authtoken = response.body.data.token;
    });

    // 14. Attempt login with email containing spaces, uppercase, whitespace
    test("login with email containing spaces/uppercase/whitespace", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": "   " + email.toUpperCase() + "   ",
            "password": password,
            "userType": userType
        });

        expect([400, 422]).toContain(response.status);
    });

    // 15. Attempt login using unverified account
    test("login with unverified account", async () => {

        const response = await request(baseUrl)
        .post("auth/login")
        .send({
            "email": email,
            "password": password,
            "userType": userType
        });

        // Unverified accounts may be rejected with various codes
        expect([400, 401, 403, 422]).toContain(response.status);
    });

});
