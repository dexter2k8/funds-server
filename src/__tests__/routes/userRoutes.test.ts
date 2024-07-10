import { describe, test, expect } from "@jest/globals";
import { user } from "../integration/index.test";

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
});

export default describe;
