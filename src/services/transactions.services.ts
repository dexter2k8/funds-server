import database from "../data-source";
import { AppError } from "../errors/appError";
import { ITransactionPatchRequest, ITransactionRequest, ITransactionResponse } from "../interfaces";
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

export function getSelfTransactionsService(
  userId: string,
  offset = "0",
  limit = "10",
  callback: (err: Error | null, rows?: ITransactionResponse[]) => void,
  group_by?: string,
  fund_alias?: string
) {
  const fundFilter = fund_alias ? `AND fund_alias = '${fund_alias}'` : "";
  const groupFilter = group_by ? `GROUP BY ${group_by}` : "";
  const sql = `SELECT * 
  FROM transactions 
  WHERE user_id = '${userId}' ${fundFilter} ${groupFilter}
  ORDER BY bought_at DESC
  LIMIT ${limit} OFFSET ${offset}
  `;
  database.all(sql, function (err, rows: ITransactionResponse[]) {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, rows);
  });
}

export function updateTransactionService(
  id: string,
  userId: string,
  transaction: ITransactionPatchRequest,
  callback: (err: Error | null, row?: ITransactionPatchRequest) => void
) {
  const isEmpty = Object.keys(transaction).length === 0;
  if (isEmpty) return callback(new AppError("Missing fields", 400));

  if (!id) return callback(new AppError("Missing id", 400));

  const keys = [...Object.keys(transaction), "user_id"];
  const values = [...Object.values(transaction), userId];
  const query = keys.map((el) => `${el} = ?`);
  const sql = `UPDATE transactions SET ${query.join(",")} WHERE id = ? RETURNING *`;
  const params = [...values, id];
  database.get(sql, params, (err, row: ITransactionResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, row);
  });
}
