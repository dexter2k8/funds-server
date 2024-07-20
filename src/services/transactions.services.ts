import database from "../data-source";
import { AppError } from "../errors/appError";
import { ITransactionRequest, ITransactionResponse } from "../interfaces";
import { v4 as uuid } from "uuid";

export function createTransactionService(
  userId: string,
  transaction: ITransactionRequest,
  callback: (err: Error | null, row?: unknown) => void
) {
  const keys = ["id", ...Object.keys(transaction), "user_id"];
  const values = Object.values(transaction);
  const mark = Array(keys.length).fill("?");
  const sql = `INSERT INTO transactions (${keys.join(", ")}) VALUES (${mark.join(
    ", "
  )}) RETURNING *`;
  const id = uuid();
  const params = [id, ...values, userId];
  database.get(sql, params, (err, row: ITransactionResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, row);
  });
}
