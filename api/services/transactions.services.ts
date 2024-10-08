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
  callback: (err: Error | null, rows?: { data: ITransactionResponse[]; count: number }) => void,
  group_by?: string,
  fund_alias?: string
) {
  const fundFilter = fund_alias ? `AND fund_alias = '${fund_alias}'` : "";
  const groupFilter = group_by ? `GROUP BY ${group_by}` : "";
  const sql = `SELECT *
  FROM transactions
  LEFT JOIN funds ON funds.alias = transactions.fund_alias
  WHERE user_id = '${userId}' ${fundFilter} ${groupFilter}
  ORDER BY bought_at DESC
  LIMIT ${limit} OFFSET ${offset}
  `;
  const countSql = `SELECT COUNT (*) AS count 
  FROM transactions 
  WHERE user_id = '${userId}' ${fundFilter} ${groupFilter}
  `;
  database.all(sql, function (err, rows: ITransactionResponse[]) {
    if (err) return callback(new AppError(err.message, 400));
    const transactions = rows.map(({ user_id, ...rest }) => rest);
    database.get(countSql, function (err, count: { count: number }) {
      if (err) return callback(new AppError(err.message, 400));
      callback(null, { data: transactions, count: count.count });
    });
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

export function deleteTransactionService(
  id: string,
  callback: (err: Error | null, row?: unknown) => void
) {
  const sql = "DELETE FROM transactions WHERE id = ?";
  const params = [id];
  database.run(sql, params, function (err) {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, { deleted: !!this.changes });
  });
}
