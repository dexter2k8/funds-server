import { describe, test, expect } from "@jest/globals";
import { login, user } from "../integration/index.test";
import request from "supertest";
import app from "../../app";
import { mockedUser } from "../mocks";

describe("/users - USERS ROUTE TESTS", () => {
  test("POST /users -  Must be able to create a user", async () => {
    expect(user.body).toHaveProperty("id");
    expect(user.body).toHaveProperty("name");
    expect(user.body).toHaveProperty("email");
    expect(user.body).not.toHaveProperty("password");
    expect(user.body.name).toEqual("Joana");
    expect(user.body.email).toEqual("joana@mail.com");
    expect(user.status).toBe(201);
  });

  test("POST /users -  should not be able to create a user that already exists", async () => {
    const response = await request(app).post("/users").send(mockedUser);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(409);
  });

  test("GET /users -  Must be able to list users", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).not.toHaveProperty("password");
  });

  test("PATCH /users/:id - should not be able to update user with invalid id", async () => {
    const newValues = { name: "Joana Brito", email: "joanabrito@mail.com" };
    const token = `Bearer ${login.body.token}`;

    const response = await request(app)
      .patch(`/users/13970660-5dbe-423a-9a9d-5c23b37943cf`)
      .set("Authorization", token)
      .send(newValues);

    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(404);
  });

  test("PATCH /users/:id -  should be able to update user", async () => {
    const newValues = { name: "Joana Brito", email: "joanabrito@mail.com" };
    const token = `Bearer ${login.body.token}`;
    const userTobeUpdateId = user.body.id;

    const response = await request(app)
      .patch(`/users/${userTobeUpdateId}`)
      .set("Authorization", token)
      .send(newValues);

    expect(response.status).toBe(200);
    expect(response.body.name).toEqual("Joana Brito");
    expect(response.body).not.toHaveProperty("password");
  });

  test("DELETE /users/:id -  should not be able to delete user with invalid id", async () => {
    await request(app).post("/users").send(mockedUser);
    const response = await request(app)
      .delete(`/users/13970660-5dbe-423a-9a9d-5c23b37943cf`)
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });

  test("DELETE /users/:id -  Must be able to delete user", async () => {
    const response = await request(app)
      .delete(`/users/${user.body.id}`)
      .set("Authorization", `Bearer ${login.body.token}`);
    const findUser = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(response.status).toBe(204);
  });
});

export default describe;
