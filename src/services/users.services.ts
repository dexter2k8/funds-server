import database from "../data-source";
import { AppError } from "../errors/appError";
import { IUserRequest } from "../interfaces";
import { v4 as uuid } from "uuid";

export function createUserService(
  { name, email, password }: IUserRequest,
  callback: (err: Error | null, rows?: any) => void
) {
  const id = uuid();
  const sql = "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?) RETURNING *";
  const params = [id, name, email, password];
  database.get(sql, params, (err, rows) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, rows);
  });
}
