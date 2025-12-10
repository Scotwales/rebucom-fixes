const request = require("supertest");
const baseUrl = process.env.BASE_URL;
const getAuthData = require("../utilities/getAuthData.js");
let merchantId = "";
let authData ;
let email;
let userType;
const password = "Password@1";

beforeAll(async () => {
  authData = await getAuthData();
  email = authData.email;
  userType = authData.userType;
});


describe("Testcase for checking active users", () => {


    test("Check active users with an unauthenticated user account", async () => {

        const response = await request (baseUrl)
        .post("auth/is-authenticated")
        .set("Authorization", `Bearer ${""}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("No token provided");
        
    });

    test("Check active users with an authenticated user account", async () => {

        const response = await request (baseUrl)
        .post("auth/is-authenticated")
        .set("Authorization", `Bearer ${authData.token}`);

        expect(response.status).toBe(200);

        
    });


});