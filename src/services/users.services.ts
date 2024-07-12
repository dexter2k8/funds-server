import database from "../data-source";
import { AppError } from "../errors/appError";
import { IUserPatchRequest, IUserRequest, IUserResponse } from "../interfaces";
import { v4 as uuid } from "uuid";
import { hashSync } from "bcryptjs";
import { RunResult } from "sqlite3";

export function createUserService(
  { name, email, password }: IUserRequest,
  callback: (err: Error | null, row?: unknown) => void
) {
  const id = uuid();
  const pass = hashSync(password, 10);
  const sql = "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?) RETURNING *";
  const params = [id, name, email, pass];
  database.get(sql, params, (err, row: IUserResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    delete row["password"];
    callback(null, row);
  });
}

export function updateUserService(
  id: string,
  user: IUserPatchRequest,
  callback: (err: Error | null, row?: IUserPatchRequest) => void
) {
  const isEmpty = Object.keys(user).length === 0;
  if (isEmpty) return callback(new AppError("Missing fields", 400));

  let userData = user;
  if (user.password) userData = { ...user, password: hashSync(user.password, 10) };

  const keys = Object.keys(userData);
  const values = Object.values(userData);
  const query = keys.map((el) => `${el} = ?`);
  const sql = `UPDATE users SET ${query.join(",")} WHERE id = ? RETURNING *`;
  const params = [...values, id];
  database.get(sql, params, (err, row: IUserResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    delete row["password"];
    callback(null, row);
  });
}

export function getUsersService(
  offset = 0,
  limit = 10,
  callback: (err: Error | null, rows?: IUserResponse[]) => void
) {
  const sql = `SELECT * FROM users ORDER BY name LIMIT ${limit} OFFSET ${offset}`;
  database.all(sql, function (err, rows: IUserResponse[]) {
    if (err) return callback(new AppError(err.message, 400));
    const users = rows.map(({ password, ...rest }) => rest);
    callback(null, users);
  });
}

export function retrieveUserService(
  id: string,
  callback: (err: Error | null, row?: IUserResponse) => void
) {
  const sql = "SELECT * FROM users WHERE id = ?";
  const params = [id];
  database.get(sql, params, (err, row: IUserResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    delete row["password"];
    callback(null, row);
  });
}

export function deleteUserService(
  id: string,
  callback: (err: Error | null, row?: unknown) => void
) {
  const sql = "DELETE FROM users WHERE id = ?";
  const params = [id];
  database.run(sql, params, function (err) {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, { deleted: !!this.changes });
  });
}
