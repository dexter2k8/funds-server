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

export function getLatestTransactionsService(
  userId: string,
  offset = "0",
  limit = "10",
  callback: (err: Error | null, rows?: ITransactionResponse[]) => void,
  fund_alias?: string
) {
  const fundFilter = fund_alias ? `AND fund_alias = '${fund_alias}'` : "";

  // transactions_with_lag: get the previous line quantity for variation calculation
  // latest_transactions: returns the most recent transaction for each fund
  // quantity_diff: get the quantity difference between the latest transaction and the previous one
  const sql = `
  WITH transactions_with_lag AS (
    SELECT
        t1.*,
        f.name,
        LAG(quantity) OVER (PARTITION BY fund_alias ORDER BY bought_at) AS prev_quantity,
        ROW_NUMBER() OVER (PARTITION BY fund_alias ORDER BY bought_at DESC) AS rn
    FROM
        transactions t1
    LEFT JOIN
    funds f ON t1.fund_alias = f.alias
),
latest_transactions AS (
    SELECT 
        t2.*,       
        quantity - COALESCE(prev_quantity, 0) AS quantity_diff
    FROM
        transactions_with_lag t2
    WHERE
        rn = 1
)
SELECT
    id,
    bought_at,
    price,
    user_id,
    fund_alias,
    name,
    quantity_diff AS quantity
FROM
    latest_transactions
WHERE 
    user_id = '${userId}' ${fundFilter}
LIMIT ${limit} OFFSET ${offset}
  `;

  database.all(sql, function (err, rows: ITransactionResponse[]) {
    if (err) return callback(new AppError(err.message, 400));
    const transactions = rows.map(({ user_id, ...rest }) => rest);
    callback(null, transactions);
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
