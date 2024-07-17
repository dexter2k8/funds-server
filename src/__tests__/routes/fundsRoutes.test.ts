import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import { mockedFund } from "../mocks";
import { adminLogin, fund, userLogin } from "../integration/index.test";
import app from "../../app";

describe("/funds - FUNDS ROUTE TEST", () => {
  test("POST /funds -  Must be able to create a fund", async () => {
    expect(fund.status).toBe(201);
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
    expect(response.body.data).toHaveLength(1);
    expect(response.status).toBe(200);
  });

  test("GET /funds/:alias -  should not be able to retrieve fund without authentication", async () => {
    const fundTobeRetrievedAlias = fund.body.alias;
    const response = await request(app).get(`/funds/${fundTobeRetrievedAlias}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("GET /funds/:alias -  should not be able to retrieve fund with invalid id", async () => {
    const response = await request(app)
      .get(`/funds/XXXX11`)
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(404);
  });

  test("GET /funds/:alias -  should  be able to retrieve fund", async () => {
    const fundTobeRetrievedAlias = fund.body.alias;
    const response = await request(app)
      .get(`/funds/${fundTobeRetrievedAlias}`)
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.body).toHaveProperty("alias");
    expect(response.status).toBe(200);
  });

  test("PATCH /funds/:alias -  should not be able to update fund without authentication", async () => {
    const response = await request(app).patch(`/funds/${fund.body.alias}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("PATCH /funds/:alias - should not be able to update fund with invalid id", async () => {
    const newValues = { alias: "HGLG13" };
    const token = `Bearer ${adminLogin.body.token}`;
    const response = await request(app)
      .patch(`/funds/XXXX11`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(404);
  });

  test("PATCH /funds/:alias - should not be able to update fund if not admin", async () => {
    const newValues = { alias: "HGLG13" };
    const token = `Bearer ${userLogin.body.token}`;
    const fundTobeUpdateAlias = fund.body.alias;
    const response = await request(app)
      .patch(`/funds/${fundTobeUpdateAlias}`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });

  test("PATCH /funds/:alias -  should be able to update fund", async () => {
    const newValues = { name: "Test Fund Update" };
    const token = `Bearer ${adminLogin.body.token}`;
    const fundTobeUpdateAlias = fund.body.alias;
    const response = await request(app)
      .patch(`/funds/${fundTobeUpdateAlias}`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.status).toBe(200);
    expect(response.body.name).toEqual("Test Fund Update");
  });

  test("DELETE /funds/:alias - should not be able to delete fund if not admin", async () => {
    const response = await request(app)
      .delete(`/users/${fund.body.alias}`)
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(403);
  });

  test("DELETE /funds/:alias -  should not be able to delete fund with invalid id", async () => {
    const response = await request(app)
      .delete(`/funds/XXXX11`)
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });

  test("DELETE /funds/:alias -  Must be able to delete fund", async () => {
    const response = await request(app)
      .delete(`/funds/${fund.body.alias}`)
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.status).toBe(204);
  });
});

export default describe;
