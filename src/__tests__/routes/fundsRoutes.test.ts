import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import { mockedFund } from "../mocks";
import { adminLogin, fund, userLogin } from "../integration/index.test";
import app from "../../app";

describe("/funds - FUNDS ROUTE TEST", () => {
  test("POST /funds -  Must be able to create a fund", async () => {
    expect(fund.status).toBe(201);
    expect(fund.body).toHaveProperty("id");
    expect(fund.body).toHaveProperty("alias");
    expect(fund.body).toHaveProperty("name");
    expect(fund.body).toHaveProperty("description");
    expect(fund.body).toHaveProperty("type");
    expect(fund.body).toHaveProperty("sector");
  });

  test("POST /funds -  Should not be able to create fund that already exists", async () => {
    const response = await request(app)
      .post("/funds")
      .set("Authorization", `Bearer ${adminLogin.body.token}`)
      .send(mockedFund);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(409);
  });

  test("GET /funds -  Must be able to list all funds", async () => {
    const response = await request(app)
      .get("/funds")
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.body).toHaveLength(1);
    expect(response.status).toBe(200);
  });

  test("GET /funds/:id -  should not be able to retrieve fund without authentication", async () => {
    const fundTobeRetrievedId = fund.body.id;
    const response = await request(app).get(`/funds/${fundTobeRetrievedId}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("GET /funds/:id -  should not be able to retrieve fund with invalid id", async () => {
    const response = await request(app)
      .get(`/funds/13970660-5dbe-423a-9a9d-5c23b37943cf`)
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(404);
  });

  test("GET /funds/:id -  should  be able to retrieve fund", async () => {
    const fundTobeRetrievedId = fund.body.id;
    const response = await request(app)
      .get(`/funds/${fundTobeRetrievedId}`)
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.body).toHaveProperty("alias");
    expect(response.status).toBe(200);
  });

  test("PATCH /funds/:id -  should not be able to update fund without authentication", async () => {
    const response = await request(app).patch(`/funds/${fund.body.id}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("PATCH /funds/:id - should not be able to update fund with invalid id", async () => {
    const newValues = { alias: "HGLG13" };
    const token = `Bearer ${adminLogin.body.token}`;
    const response = await request(app)
      .patch(`/funds/13970660-5dbe-423a-9a9d-5c23b37943cf`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(404);
  });

  test("PATCH /funds/:id - should not be able to update fund if not admin", async () => {
    const newValues = { alias: "HGLG13" };
    const token = `Bearer ${userLogin.body.token}`;
    const fundTobeUpdateId = fund.body.id;
    const response = await request(app)
      .patch(`/funds/${fundTobeUpdateId}`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });

  test("PATCH /funds/:id -  should be able to update fund", async () => {
    const newValues = { alias: "HGLG13" };
    const token = `Bearer ${adminLogin.body.token}`;
    const fundTobeUpdateId = fund.body.id;
    const response = await request(app)
      .patch(`/funds/${fundTobeUpdateId}`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.status).toBe(200);
    expect(response.body.alias).toEqual("HGLG13");
  });
});

export default describe;
