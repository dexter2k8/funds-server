import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app";
import { mockedUser } from "../mocks";
import { admin, adminLogin, user, userLogin } from "../integration/index.test";

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
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).not.toHaveProperty("password");
  });

  test("GET /users -  should not be able to list users without authentication", async () => {
    const response = await request(app).get("/users");
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("GET /users -  should not be able to list users not being admin", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(403);
  });

  test("GET /users/:id -  should not be able to retrieve user not being admin", async () => {
    const userTobeRetrievedId = admin.body.id;
    const response = await request(app)
      .get(`/users/${userTobeRetrievedId}`)
      .set("Authorization", `Bearer ${userLogin.body.token}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(403);
  });

  test("GET /users/:id -  should not be able to retrieve user with invalid id", async () => {
    const response = await request(app)
      .get(`/users/13970660-5dbe-423a-9a9d-5c23b37943cf`)
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(404);
  });

  test("GET /users/:id -  should  be able to retrieve user", async () => {
    const userTobeRetrievedId = user.body.id;
    const response = await request(app)
      .get(`/users/${userTobeRetrievedId}`)
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.body).toHaveProperty("name");
    expect(response.body).not.toHaveProperty("password");
    expect(response.status).toBe(200);
  });

  test("PATCH /users/:id -  should not be able to update user without authentication", async () => {
    const response = await request(app).patch(`/users/${user.body.id}`);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(401);
  });

  test("PATCH /users/:id - should not be able to update user with invalid id", async () => {
    const newValues = { name: "Joana Brito", email: "joanabrito@mail.com" };
    const token = `Bearer ${adminLogin.body.token}`;
    const response = await request(app)
      .patch(`/users/13970660-5dbe-423a-9a9d-5c23b37943cf`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.body).toHaveProperty("message");
    expect(response.status).toBe(404);
  });

  test("PATCH /users/:id - should not be able to update admin field if not admin", async () => {
    const newValues = { admin: true };
    const token = `Bearer ${userLogin.body.token}`;
    const userTobeUpdateId = admin.body.id;
    const response = await request(app)
      .patch(`/users/${userTobeUpdateId}`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });

  test("PATCH /users/:id - should not be able to update another user without adm permission", async () => {
    const newValues = { name: "Joana Brito", email: "joanabrito@mail.com" };
    const userToken = `Bearer ${userLogin.body.token}`;
    const userTobeUpdateId = admin.body.id;
    const response = await request(app)
      .patch(`/users/${userTobeUpdateId}`)
      .set("Authorization", userToken)
      .send(newValues);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });

  test("PATCH /users/:id -  should be able to update user", async () => {
    const newValues = { name: "Joana Brito", email: "joanabrito@mail.com" };
    const token = `Bearer ${adminLogin.body.token}`;
    const userTobeUpdateId = user.body.id;
    const response = await request(app)
      .patch(`/users/${userTobeUpdateId}`)
      .set("Authorization", token)
      .send(newValues);
    expect(response.status).toBe(200);
    expect(response.body.name).toEqual("Joana Brito");
    expect(response.body).not.toHaveProperty("password");
  });

  test("PATCH /users/:id -  should be able to update myself", async () => {
    const newValues = { name: "Joana Dark", email: "joanadark@mail.com" };
    const token = `Bearer ${userLogin.body.token}`;
    const response = await request(app).patch(`/users`).set("Authorization", token).send(newValues);
    expect(response.status).toBe(200);
    expect(response.body.name).toEqual("Joana Dark");
    expect(response.body).not.toHaveProperty("password");
  });

  test("DELETE /users/:id -  should not be able to delete user with invalid id", async () => {
    await request(app).post("/users").send(mockedUser);
    const response = await request(app)
      .delete(`/users/13970660-5dbe-423a-9a9d-5c23b37943cf`)
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });

  test("DELETE /users/:id -  Must be able to delete user", async () => {
    const response = await request(app)
      .delete(`/users/${user.body.id}`)
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    const findUser = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${adminLogin.body.token}`);
    expect(response.status).toBe(204);
  });
});

export default describe;
