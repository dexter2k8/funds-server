import request from "supertest";
import { beforeAll } from "@jest/globals";
import { promisify } from "util";
import * as users from "../routes/userRoutes.test";

export let user: request.Response;

import sqlite3 from "sqlite3";
import database, { SQL_CREATE_TABLES } from "../../data-source";
import { mockedUser } from "../mocks";
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
});

users;
