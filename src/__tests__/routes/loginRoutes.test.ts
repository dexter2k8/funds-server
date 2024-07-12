import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app";
import { login } from "../integration/index.test";

describe("/login - LOGIN ROUTE TESTS ", () => {
  test("POST /login -  should be able to login with the user", async () => {
    expect(login.body).toHaveProperty("token");
    expect(login.status).toBe(200);
  });

  test("POST /login -  should not be able to login with the user with incorrect password or email", async () => {
    const response = await request(app).post("/login").send({
      email: "felipe@mail.com",
      password: "1234567",
    });

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(400);
  });
});

export default describe;
