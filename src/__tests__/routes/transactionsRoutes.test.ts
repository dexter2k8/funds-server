import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import { adminLogin, transaction, userLogin } from "../integration/index.test";
import app from "../../app";
import { mockedTransaction } from "../mocks";

describe("/transactions - TRANSACTIONS ROUTE TEST", () => {
  test("POST /transactions -  Must be able to create a transaction", async () => {
    expect(transaction.status).toBe(201);
    expect(transaction.body).toHaveProperty("id");
    expect(transaction.body).toHaveProperty("price");
    expect(transaction.body).toHaveProperty("updated_at");
    expect(transaction.body).toHaveProperty("quantity");
    expect(transaction.body).toHaveProperty("fund_alias");
    expect(transaction.body).toHaveProperty("user_id");
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

  test("GET /transactions -  should not be able to retrieve transaction without authentication", async () => {
    const fundTobeRetrievedAlias = transaction.body.fundAlias;
    const response = await request(app).get(`/transactions`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("GET /transactions -  Must be able to list all transactions for logged user", async () => {
    const response = await request(app)
      .get("/transactions")
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body.data).toHaveLength(1);
    expect(response.status).toBe(200);
  });

  test("PATCH /transactions/:id -  should not be able to update transaction without authentication", async () => {
    const response = await request(app).patch(`/funds/${transaction.body.alias}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("PATCH /transactions/:id -  should not be able to update transaction you don't own", async () => {
    const newValues = { price: 200 };
    const token = `Bearer ${adminLogin.body.token}`;
    const transactionTobeUpdateId = transaction.body.id;
    const response = await request(app)
      .patch(`/transactions/${transactionTobeUpdateId}`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });

  test("PATCH /transactions/:id -  should be able to update transaction", async () => {
    const newValues = { price: 200 };
    const token = `Bearer ${userLogin.body.token}`;
    const transactionTobeUpdateId = transaction.body.id;
    const response = await request(app)
      .patch(`/transactions/${transactionTobeUpdateId}`)
      .set("Authorization", token)
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
    const token = `Bearer ${adminLogin.body.token}`;
    const transactionTobeRemoveId = transaction.body.id;
    const response = await request(app)
      .delete(`/transactions/${transactionTobeRemoveId}`)
      .set("Authorization", token);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });

  test("DELETE /transactions/:id -  should be able to remove transaction", async () => {
    const token = `Bearer ${userLogin.body.token}`;
    const transactionTobeRemoveId = transaction.body.id;
    const response = await request(app)
      .delete(`/transactions/${transactionTobeRemoveId}`)
      .set("Authorization", token);
    expect(response.status).toBe(204);
  });
});

export default describe;
