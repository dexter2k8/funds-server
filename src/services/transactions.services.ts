import database from "../data-source";
import { AppError } from "../errors/appError";
import {
  ITransactionPatchRequest,
  ITransactionProfit,
  ITransactionRequest,
  ITransactionResponse,
} from "../interfaces";
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
  init_date: string,
  end_date: string,
  group_by: string,
  callback: (err: Error | null, rows?: { data: ITransactionResponse[]; totals: unknown }) => void,
  fundAlias?: string
) {
  const fundFilter = fundAlias ? `AND fund_alias = '${fundAlias}'` : "";
  const dateFilter =
    init_date && end_date ? `AND updated_at BETWEEN '${init_date}' AND '${end_date}'` : "";
  const groupFilter = group_by ? `GROUP BY ${group_by}` : "";

  const sql = `SELECT transactions.*,
  (transactions.price * transactions.quantity) AS patrimony,
  (transactions.income * 100.0 / (transactions.price * transactions.quantity)) AS pvp
  FROM transactions 
  WHERE user_id = '${userId}' ${fundFilter} ${dateFilter} ${groupFilter}
  ORDER BY updated_at 
  LIMIT ${limit} OFFSET ${offset}
  `;

  const countSql = `SELECT COUNT (*) AS count,
  SUM(income * 100.0 / (price * quantity)) AS sum_pvp,
  SUM(income) AS sum_incomes
  FROM transactions 
  WHERE user_id = '${userId}' ${fundFilter} ${dateFilter}
  `;

  database.all(sql, function (err, rows: ITransactionResponse[]) {
    if (err) return callback(new AppError(err.message, 400));
    const transactions = rows.map(({ user_id, ...rest }) => rest);
    database.get(countSql, function (err, totals) {
      if (err) return callback(new AppError(err.message, 400));
      callback(null, { data: transactions, totals });
    });
  });
}

export function getSelfProfitsService(
  userId: string,
  fund_alias: string,
  init_date: string,
  end_date: string,
  callback: (err: Error | null, rows?: unknown) => void
) {
  const fundFilter = fund_alias ? `AND fund_alias = '${fund_alias}'` : "";
  const dateFilter =
    init_date && end_date ? `AND updated_at BETWEEN '${init_date}' AND '${end_date}'` : "";

  const sql = `SELECT strftime('%Y-%m', updated_at) AS year_month,
  SUM(income) AS sum_incomes
  FROM transactions 
  WHERE user_id = '${userId}' ${dateFilter} ${fundFilter}
  GROUP BY strftime('%Y-%m', updated_at)
  `;

  const profitSql = `WITH FirstValuePerMonth AS (
  SELECT fund_alias,
    strftime('%Y-%m', updated_at) AS year_month,
    price,
    quantity,
    ROW_NUMBER() OVER (PARTITION BY fund_alias, strftime('%Y-%m', updated_at) ORDER BY updated_at) AS row_num
  FROM transactions
  WHERE user_id = '${userId}' ${dateFilter} ${fundFilter}
),
FirstValuePerMonthFiltered AS (
  SELECT
    fund_alias,
    year_month,
    price,
    quantity
  FROM
    FirstValuePerMonth
  WHERE
    row_num = 1
)
SELECT
  year_month,
  SUM(price * quantity) AS sum_patrimony
FROM
  FirstValuePerMonthFiltered
GROUP BY
  year_month
ORDER BY
  year_month
  `;

  database.all(sql, function (err, rows: ITransactionProfit[]) {
    if (err) return callback(new AppError(err.message, 400));
    database.all(profitSql, function (err, totals: ITransactionProfit[]) {
      if (err) return callback(new AppError(err.message, 400));
      const transactions = rows.map((transaction) => {
        const total = totals.find((t) => t.year_month === transaction.year_month);
        return {
          year_month: transaction.year_month,
          sum_incomes: transaction.sum_incomes,
          sum_patrimony: total ? total.sum_patrimony : null,
        };
      });

      callback(null, transactions);
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
