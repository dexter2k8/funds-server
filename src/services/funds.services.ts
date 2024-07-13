import database from "../data-source";
import { AppError } from "../errors/appError";
import { IFundPatchRequest, IFundRequest, IFundResponse } from "../interfaces";
import { v4 as uuid } from "uuid";

export function createFundService(
  fund: IFundRequest,
  callback: (err: Error | null, row?: unknown) => void
) {
  const keys = ["id", ...Object.keys(fund)];
  const values = Object.values(fund);
  const mark = Array(keys.length).fill("?");
  const id = uuid();
  const sql = `INSERT INTO funds (${keys.join(", ")}) VALUES (${mark.join(", ")}) RETURNING *`;
  const params = [id, ...values];
  database.get(sql, params, (err, row: IFundResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, row);
  });
}

export function getFundsService(
  offset = 0,
  limit = 10,
  callback: (err: Error | null, rows?: IFundResponse[]) => void
) {
  const sql = `SELECT * FROM funds ORDER BY alias LIMIT ${limit} OFFSET ${offset}`;
  database.all(sql, function (err, rows: IFundResponse[]) {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, rows);
  });
}

export function retrieveFundService(
  id: string,
  callback: (err: Error | null, row?: IFundResponse) => void
) {
  const sql = "SELECT * FROM funds WHERE id = ?";
  const params = [id];
  database.get(sql, params, (err, row: IFundResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, row);
  });
}

export function updateFundService(
  id: string,
  user: IFundPatchRequest,
  callback: (err: Error | null, row?: IFundPatchRequest) => void
) {
  const isEmpty = Object.keys(user).length === 0;
  if (isEmpty) return callback(new AppError("Missing fields", 400));

  if (!id) return callback(new AppError("Missing id", 400));

  const keys = Object.keys(user);
  const values = Object.values(user);
  const query = keys.map((el) => `${el} = ?`);
  const sql = `UPDATE funds SET ${query.join(",")} WHERE id = ? RETURNING *`;
  const params = [...values, id];
  database.get(sql, params, (err, row: IFundResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, row);
  });
}
