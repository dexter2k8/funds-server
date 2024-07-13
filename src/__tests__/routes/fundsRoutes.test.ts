import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import { mockedFund } from "../mocks";
import { adminLogin } from "../integration/index.test";
import app from "../../app";

describe("/technologies - ROUTE TECHNOLOGIES TEST", () => {
  test("POST /technologies -  Must be able to create a fund", async () => {
    const response = await request(app)
      .post("/funds")
      .set("Authorization", `Bearer ${adminLogin.body.token}`)
      .send(mockedFund);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("alias");
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("sector");
  });

  test("POST /technologies -  Should not be able to create fund that already exists", async () => {
    const response = await request(app)
      .post("/funds")
      .set("Authorization", `Bearer ${adminLogin.body.token}`)
      .send(mockedFund);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(409);
  });

  test("GET /technologies -  Must be able to list all funds", async () => {
    const response = await request(app)
      .get("/funds")
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.body).toHaveLength(1);
    expect(response.status).toBe(200);
  });
});

export default describe;
