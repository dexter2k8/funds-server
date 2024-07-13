import request from "supertest";
import { beforeAll } from "@jest/globals";
import { promisify } from "util";
import * as usersRoutes from "../routes/userRoutes.test";
import * as loginRoutes from "../routes/loginRoutes.test";
import * as fundsRoutes from "../routes/fundsRoutes.test";

export let user: request.Response;
export let admin: request.Response;
export let userLogin: request.Response;
export let adminLogin: request.Response;

import sqlite3 from "sqlite3";
import database, { SQL_CREATE_TABLES } from "../../data-source";
import { mockedAdmin, mockedUser } from "../mocks";
import app from "../../app";

const createNodeSqlite2Executor = (db: sqlite3.Database) => {
  const allPromise = promisify(db.all).bind(db);
  return { write: (query: string) => allPromise(query) };
};
const nodeExecutor = createNodeSqlite2Executor(database);
export const userQueries = nodeExecutor.write(SQL_CREATE_TABLES);

beforeAll(async () => {
  await userQueries;

  user = await request(app).post("/users").send(mockedUser);
  admin = await request(app).post("/users").send(mockedAdmin);
  userLogin = await request(app).post("/login").send(mockedUser);
  adminLogin = await request(app).post("/login").send(mockedAdmin);
});

usersRoutes;
loginRoutes;
fundsRoutes;
