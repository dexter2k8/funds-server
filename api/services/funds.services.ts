import database from "../data-source";
import { AppError } from "../errors/appError";
import { IFundPatchRequest, IFundRequest } from "../interfaces";
import { v4 as uuid } from "uuid";

export function createFundService(
  fund: IFundRequest,
  callback: (err: Error | null, row?: unknown) => void
) {
  const keys = Object.keys(fund);
  const params = Object.values(fund);
  const mark = Array(keys.length).fill("?");
  const sql = `INSERT INTO funds (${keys.join(", ")}) VALUES (${mark.join(", ")}) RETURNING *`;
  database.get(sql, params, (err, row: IFundRequest) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, row);
  });
}

export function getFundsService(
  offset = "0",
  limit = "1000",
  callback: (err: Error | null, rows?: { data: IFundRequest[]; count: number }) => void
) {
  const sql = `SELECT * FROM funds ORDER BY alias LIMIT ${limit} OFFSET ${offset}`;
  const countSql = "SELECT COUNT (*) AS count FROM funds";

  database.all(sql, function (err, rows: IFundRequest[]) {
    if (err) return callback(new AppError(err.message, 400));
    database.get(countSql, function (err, count: { count: number }) {
      if (err) return callback(new AppError(err.message, 400));
      callback(null, { data: rows, count: count.count });
    });
  });
}

export function retrieveFundService(
  alias: string,
  callback: (err: Error | null, row?: IFundRequest) => void
) {
  const sql = "SELECT * FROM funds WHERE alias = ?";
  const params = [alias];
  database.get(sql, params, (err, row: IFundRequest) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, row);
  });
}

export function getSelfFundsService(
  userId: string,
  callback: (err: Error | null, row?: IFundRequest) => void
) {
  // get all funds owned by user, based on latest transaction of each fund
  const sql = `
  SELECT f.*
FROM funds f
JOIN (
    SELECT t.fund_alias, MAX(t.bought_at) as latest_bought_at
    FROM transactions t
    WHERE t.user_id = ?
    GROUP BY t.fund_alias
) latest ON latest.fund_alias = f.alias
JOIN transactions t ON t.fund_alias = latest.fund_alias AND t.bought_at = latest.latest_bought_at
WHERE t.quantity > 0;  
  `;

  const params = [userId];
  database.all(sql, params, (err: Error | null, row: IFundRequest) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, row);
  });
}

export function updateFundService(
  alias: string,
  user: IFundPatchRequest,
  callback: (err: Error | null, row?: IFundPatchRequest) => void
) {
  const isEmpty = Object.keys(user).length === 0;
  if (isEmpty) return callback(new AppError("Missing fields", 400));

  if (!alias) return callback(new AppError("Missing alias", 400));

  const keys = Object.keys(user);
  const values = Object.values(user);
  const query = keys.map((el) => `${el} = ?`);
  const sql = `UPDATE funds SET ${query.join(",")} WHERE alias = ? RETURNING *`;
  const params = [...values, alias];
  database.get(sql, params, (err, row: IFundRequest) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, row);
  });
}

export function deleteFundService(
  alias: string,
  callback: (err: Error | null, row?: unknown) => void
) {
  const sql = "DELETE FROM funds WHERE alias = ?";
  const params = [alias];
  database.run(sql, params, function (err) {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, { deleted: !!this.changes });
  });
}
