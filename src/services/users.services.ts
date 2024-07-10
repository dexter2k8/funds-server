import database from "../data-source";
import { AppError } from "../errors/appError";
import { IUserRequest, IUserResponse } from "../interfaces";
import { v4 as uuid } from "uuid";
import { hashSync } from "bcryptjs";

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
