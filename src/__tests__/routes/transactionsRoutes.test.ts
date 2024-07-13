import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import { transaction, userLogin } from "../integration/index.test";
import app from "../../app";
import { mockedTransaction } from "../mocks";

describe("/transactions - TRANSACTIONS ROUTE TEST", () => {
  test("POST /transactions -  Must be able to create a transaction", async () => {
    expect(transaction.status).toBe(201);
    expect(transaction.body).toHaveProperty("id");
    expect(transaction.body).toHaveProperty("value");
    expect(transaction.body).toHaveProperty("date");
    expect(transaction.body).toHaveProperty("quantity");
    expect(transaction.body).toHaveProperty("fundAlias");
    expect(transaction.body).toHaveProperty("userId");
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
      .send({ ...mockedTransaction, fundAlias: "invalid" });
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(404);
  });

  test("GET /transactions -  Must be able to list all transactions for logged user", async () => {
    const response = await request(app)
      .get("/transactions")
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body).toHaveLength(1);
    expect(response.status).toBe(200);
  });
});

export default describe;
