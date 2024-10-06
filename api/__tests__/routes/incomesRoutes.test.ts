import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import { adminLogin, income, userLogin } from "../integration/index.test";
import app from "../..";
import { mockedIncome } from "../mocks";

describe("/incomes - INCOMES ROUTE TEST", () => {
  test("POST /incomes -  Must be able to create a income", async () => {
    expect(income.status).toBe(201);
    expect(income.body).toHaveProperty("id");
    expect(income.body).toHaveProperty("price");
    expect(income.body).toHaveProperty("updated_at");
    expect(income.body).toHaveProperty("income");
    expect(income.body).toHaveProperty("fund_alias");
    expect(income.body).toHaveProperty("user_id");
  });

  test("POST /incomes -  should not be able to create a income without authentication", async () => {
    const response = await request(app).post("/incomes").send(mockedIncome);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("POST /incomes -  should not be able to create a income with invalid fund", async () => {
    const response = await request(app)
      .post("/incomes")
      .set("Authorization", `Bearer ${userLogin.body.token}`)
      .send({ ...mockedIncome, fund_alias: "invalid" });
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(404);
  });

  test("GET /incomes -  should not be able to list incomes without authentication", async () => {
    const response = await request(app).get(`/incomes`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("GET /incomes -  should be able to list all incomes owned by logged user", async () => {
    const response = await request(app)
      .get("/incomes")
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body.data).toHaveLength(1);
    expect(response.status).toBe(200);
  });

  test("GET /incomes/self-profits -  Must be able to list all profits owned by logged user", async () => {
    const response = await request(app)
      .get("/incomes/self-profits?init_date=2022-07-01&end_date=2022-08-31")
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body[0]).toHaveProperty("year_month");
    expect(response.body[0]).toHaveProperty("total_income");
    expect(response.body[0]).toHaveProperty("total_patrimony");
    expect(response.status).toBe(200);
  });

  test("GET /incomes/self-profits/:fund_alias -  Must be able to list all profits of a specific fund owned by logged user", async () => {
    const response = await request(app)
      .get("/incomes/self-profits/HGLG11?init_date=2022-07-01&end_date=2022-08-31")
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body[0]).toHaveProperty("year_month");
    expect(response.body[0]).toHaveProperty("total_income");
    expect(response.body[0]).toHaveProperty("total_patrimony");
    expect(response.status).toBe(200);
  });

  test("GET /incomes/patrimony -  Must be able to list all patrimony by type owned by logged user", async () => {
    const response = await request(app)
      .get("/incomes/patrimony")
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body[0]).toHaveProperty("type");
    expect(response.body[0]).toHaveProperty("total_patrimony");
    expect(response.status).toBe(200);
  });

  test("PATCH /incomes/:id -  should not be able to update income without authentication", async () => {
    const response = await request(app).patch(`/funds/${income.body.alias}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("PATCH /incomes/:id -  should not be able to update income you don't own", async () => {
    const newValues = { price: 200 };
    const token = `Bearer ${adminLogin.body.token}`;
    const incomeTobeUpdateId = income.body.id;
    const response = await request(app)
      .patch(`/incomes/${incomeTobeUpdateId}`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });

  test("PATCH /incomes/:id -  should be able to update income", async () => {
    const newValues = { price: 200 };
    const token = `Bearer ${userLogin.body.token}`;
    const incomeTobeUpdateId = income.body.id;
    const response = await request(app)
      .patch(`/incomes/${incomeTobeUpdateId}`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.status).toBe(200);
    expect(response.body.price).toEqual(200);
  });

  test("DELETE /incomes/:id -  should not be able to remove income without authentication", async () => {
    const response = await request(app).delete(`/incomes/${income.body.id}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("DELETE /incomes/:id -  should not be able to remove income you don't own", async () => {
    const token = `Bearer ${adminLogin.body.token}`;
    const incomeTobeRemoveId = income.body.id;
    const response = await request(app)
      .delete(`/incomes/${incomeTobeRemoveId}`)
      .set("Authorization", token);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });

  test("DELETE /incomes/:id -  should be able to remove income", async () => {
    const token = `Bearer ${userLogin.body.token}`;
    const incomeTobeRemoveId = income.body.id;
    const response = await request(app)
      .delete(`/incomes/${incomeTobeRemoveId}`)
      .set("Authorization", token);
    expect(response.status).toBe(204);
  });
});

export default describe;
