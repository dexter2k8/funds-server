import { describe, test, expect } from "@jest/globals";
import app from "../../app";
import request from "supertest";
import { adminLogin, transaction, userLogin } from "../integration/index.test";
import { mockedTransaction } from "../mocks";

describe("/transactions - TRANSACTIONS ROUTE TEST", () => {
  test("POST /transactions -  Must be able to create a transaction", async () => {
    const response = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${userLogin.body.token}`)
      .send(mockedTransaction);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("price");
    expect(response.body).toHaveProperty("bought_at");
    expect(response.body).toHaveProperty("quantity");
    expect(response.body).toHaveProperty("fund_alias");
    expect(response.body).toHaveProperty("user_id");
  });

  test("POST /transactions -  should not be able to create a transaction without authentication", async () => {
    const response = await request(app).post("/transactions").send(mockedTransaction);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("POST /transactions -  should not be able to create a transaction with invalid fund", async () => {
    const response = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${userLogin.body.token}`)
      .send({ ...mockedTransaction, fund_alias: "invalid" });
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(404);
  });

  test("GET /transactions -  should not be able to list transactions without authentication", async () => {
    const response = await request(app).get(`/transactions`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("GET /transactions -  should be able to list transactions owned by logged user", async () => {
    const response = await request(app)
      .get(`/transactions`)
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body.data).toHaveLength(2);
    expect(response.status).toBe(200);
  });

  test("GET /transactions/latest -  should not be able to list latest transactions without authentication", async () => {
    const response = await request(app).get(`/transactions/latest`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("GET /transactions/latest -  should be able to list latest transactions owned by logged user", async () => {
    const response = await request(app)
      .get(`/transactions/latest`)
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body).toHaveLength(1);
    expect(response.status).toBe(200);
  });

  test("PATCH /transactions/:id -  should not be able to update transaction without authentication", async () => {
    const response = await request(app).patch(`/transactions/${transaction.body.id}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("PATCH /transactions/:id -  should not be able to update transaction you don't own", async () => {
    const response = await request(app)
      .patch(`/transactions/13970660-5dbe-423a-9a9d-5c23b37943cf`)
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(403);
  });

  test("PATCH /transactions/:id -  should be able to update transaction", async () => {
    const newValues = { price: 200 };
    const response = await request(app)
      .patch(`/transactions/${transaction.body.id}`)
      .set("Authorization", `Bearer ${userLogin.body.token}`)
      .send(newValues);
    expect(response.status).toBe(200);
    expect(response.body.price).toEqual(200);
  });

  test("DELETE /transactions/:id -  should not be able to remove transaction without authentication", async () => {
    const response = await request(app).delete(`/transactions/${transaction.body.id}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("DELETE /transactions/:id -  should not be able to remove transaction you don't own", async () => {
    const response = await request(app)
      .delete(`/transactions/13970660-5dbe-423a-9a9d-5c23b37943cf`)
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(403);
  });

  test("DELETE /transactions/:id -  should be able to remove transaction", async () => {
    const response = await request(app)
      .delete(`/transactions/${transaction.body.id}`)
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.status).toBe(204);
  });
});

export default describe;
