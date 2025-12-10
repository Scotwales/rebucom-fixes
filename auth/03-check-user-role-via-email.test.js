const request = require("supertest");
const baseUrl = process.env.BASE_URL;
const getAuthData = require("../utilities/getAuthData.js");

let authData;
let email;

beforeAll(async () => {
  authData = await getAuthData();
  email = authData.email;
});



describe("Testcase for checking user role", () => {

    test("Check role of a non-existing user", async () => {
        const response = await request(baseUrl)
            .post("auth/roles")
            .send({
                email: "nouser_does_not_exist@yopmail.com"
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User not found or does not exist");
    });

    test("Check role without entering user email", async () => {
        const response = await request(baseUrl)
            .post("auth/roles")
            .send({
                email: ""
            });

        expect(response.status).toBe(400);
        expect(response.body.details[0].message)
            .toBe("\"email\" is not allowed to be empty");
    });

    test("Check role using a valid user email", async () => {
        const response = await request(baseUrl)
            .post("auth/roles")
            .send({
                email: email
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("User check successful");

    });

    test("Check role using email with spaces or invalid characters", async () => {
        const response = await request(baseUrl)
            .post("auth/roles")
            .send({
                email: "   " + email + "   "
            });

        expect([200, 400]).toContain(response.status);

    });

});
