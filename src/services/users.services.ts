import database from "../data-source";
import { AppError } from "../errors/appError";
import { IIncomeResponse, IUserPatchRequest, IUserRequest, IUserResponse } from "../interfaces";
import { v4 as uuid } from "uuid";
import { hashSync } from "bcryptjs";

export function createUserService(
  { name, email, password, admin }: IUserRequest,
  callback: (err: Error | null, row?: unknown) => void
) {
  const id = uuid();
  const pass = hashSync(password, 10);
  const sql =
    "INSERT INTO users (id, name, email, password, admin) VALUES (?, ?, ?, ?, ?) RETURNING *";
  const params = [id, name, email, pass, admin];
  database.get(sql, params, (err, row: IUserResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    delete row["password"];
    callback(null, row);
  });
}

export function getUsersService(
  offset = "0",
  limit = "10",
  callback: (err: Error | null, rows?: { data: IUserResponse[]; count: number }) => void
) {
  const sql = `SELECT * FROM users ORDER BY name LIMIT ${limit} OFFSET ${offset}`;
  const countSql = "SELECT COUNT (*) AS count FROM funds";

  database.all(sql, function (err, rows: IUserResponse[]) {
    if (err) return callback(new AppError(err.message, 400));
    const users = rows.map(({ password, ...rest }) => rest);
    database.get(countSql, function (err, count: { count: number }) {
      if (err) return callback(new AppError(err.message, 400));
      callback(null, { data: users, count: count.count });
    });
  });
}

export function retrieveUserService(
  id: string,
  callback: (err: Error | null, row?: IUserResponse) => void
) {
  const sqlUser = "SELECT * FROM users WHERE id = ?";
  const params = [id];
  let user = {} as IUserResponse;
  database.get(sqlUser, params, (err, row: IUserResponse) => {
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

  if (!id) return callback(new AppError("Missing id", 400));

  let userData = user;
  if (user.password) userData = { ...user, password: hashSync(user.password, 10) };

  const keys = Object.keys(userData);
  const values = Object.values(userData);
  const query = keys.map((el) => `${el} = ?`);
  const sql = `UPDATE users SET ${query.join(",")} WHERE id = ? RETURNING *`;
  const params = [...values, id];
  database.get(sql, params, (err, row: IUserResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    if (row) delete row["password"];
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
