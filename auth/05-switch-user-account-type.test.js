const request = require("supertest");
const baseUrl = process.env.BASE_URL;
const getAuthData = require("../utilities/getAuthData.js");

const TeamId = "8e0a0d67-d810-4234-948a-7f381b10955d";
const InvalidAccountType = "InvalidRole";
const Email = "sct02@yopmail.com";
const Password = "Password1@";
const TeamOneID = "9246583f-96c7-4f06-94a9-da5cdc87ef99";
const TeamTwoID = "6faf4c2e-56be-43c1-889c-3fdaa9278638";

let authData;

beforeAll(async () => {
  authData = await getAuthData();
});

describe("testcase for switching users account type", () => {

  test("attempt to switch user account type while unauthenticated", async () => {
    const response = await request(baseUrl)
      .post("auth/switch-account")
      .send({
        userType: "MerchantTeam",
        teamId: TeamId
      })
      .set("Authorization", "Bearer ");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No token provided");
  });

  test("authenticated user attempts switching without having permission", async () => {
    const response = await request(baseUrl)
      .post("auth/switch-account")
      .send({
        userType: "MerchantTeam",
        teamId: TeamId
      })
      .set("Authorization", `Bearer ${authData.token}`);

    expect([400, 403]).toContain(response.status);
  });

  test("authenticated user with multiple merchantTeam allowed to switch to a different merchant team", async () => {
    
    // Login as MerchantTeam
    const loginResponse = await request(baseUrl)
      .post("auth/login")
      .send({
        email: Email,
        password: Password,
        userType: "MerchantTeam",
        teamId: TeamOneID
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.message).toBe("User logged in successfully");

    const token = loginResponse.body.data.token;

    // Switch to a different Merchant Team
    const switchResponse = await request(baseUrl)
      .post("auth/switch-account")
      .send({
        userType: "MerchantTeam",
        teamId: TeamTwoID
      })
      .set("Authorization", `Bearer ${token}`);

    expect(switchResponse.status).toBe(200);
    expect(switchResponse.body.data.activeRole).toBe("MerchantTeam");
    expect(switchResponse.body.data.token).toBeDefined();
  });

  test("authenticated user with multiple user Type is allowed to switch", async () => {
    
    // Login as MerchantTeam with TeamOneID
    const loginResponse = await request(baseUrl)
      .post("auth/login")
      .send({
        email: Email,
        password: Password,
        userType: "MerchantTeam",
        teamId: TeamOneID
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.message).toBe("User logged in successfully");

    const token = loginResponse.body.data.token;

    // Switch to a different user type (Customer)
    const switchResponse = await request(baseUrl)
      .post("auth/switch-account")
      .send({
        userType: "Customer"
      })
      .set("Authorization", `Bearer ${token}`);

    expect(switchResponse.status).toBe(200);
    expect(switchResponse.body.data.activeRole).toBe("Customer");
    expect(switchResponse.body.data.token).toBeDefined();
  });

  test("authenticated user with multiple MerchantTeam cannot switch to current Team", async () => {
    
    // Login as MerchantTeam with TeamOneID
    const loginResponse = await request(baseUrl)
      .post("auth/login")
      .send({
        email: Email,
        password: Password,
        userType: "MerchantTeam",
        teamId: TeamOneID
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.message).toBe("User logged in successfully");

    const token = loginResponse.body.data.token;

    // Try to switch to the same TeamID (should fail)
    const switchResponse = await request(baseUrl)
      .post("auth/switch-account")
      .send({
        userType: "MerchantTeam",
        teamId: TeamOneID
      })
      .set("Authorization", `Bearer ${token}`);

    expect(switchResponse.status).not.toBe(200);
    expect([400, 403]).toContain(switchResponse.status);
  });

  test("authenticated user with multiple merchantTeam and user Type can switch multiple times", async () => {
    
    // Step 1: Login as MerchantTeam with TeamOneID
    const loginResponse = await request(baseUrl)
      .post("auth/login")
      .send({
        email: Email,
        password: Password,
        userType: "MerchantTeam",
        teamId: TeamOneID
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.message).toBe("User logged in successfully");

    const token = loginResponse.body.data.token;

    // Step 2: Switch to a different Merchant Team (TeamTwoID)
    const firstSwitchResponse = await request(baseUrl)
      .post("auth/switch-account")
      .send({
        userType: "MerchantTeam",
        teamId: TeamTwoID
      })
      .set("Authorization", `Bearer ${token}`);

    expect(firstSwitchResponse.status).toBe(200);
    expect(firstSwitchResponse.body.data.activeRole).toBe("MerchantTeam");
    expect(firstSwitchResponse.body.data.token).toBeDefined();

    const firstSwitchToken = firstSwitchResponse.body.data.token;

    // Step 3: Switch to Customer user type
    const secondSwitchResponse = await request(baseUrl)
      .post("auth/switch-account")
      .send({
        userType: "Customer"
      })
      .set("Authorization", `Bearer ${firstSwitchToken}`);

    expect(secondSwitchResponse.status).toBe(200);
    expect(secondSwitchResponse.body.data.activeRole).toBe("Customer");
    expect(secondSwitchResponse.body.data.token).toBeDefined();
  });

  test("attempt switching to an invalid or unsupported account type", async () => {
    const response = await request(baseUrl)
      .post("auth/switch-account")
      .send({
        userType: InvalidAccountType,
        teamId: TeamId
      })
      .set("Authorization", `Bearer ${authData.token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Error in request body");
  });

});