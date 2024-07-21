import database from "../data-source";
import { AppError } from "../errors/appError";
import { IIncomePatchRequest, IIncomeProfit, IIncomeRequest, IIncomeResponse } from "../interfaces";
import { v4 as uuid } from "uuid";

export function createIncomeService(
  userId: string,
  income: IIncomeRequest,
  callback: (err: Error | null, row?: unknown) => void
) {
  const keys = ["id", ...Object.keys(income), "user_id"];
  const values = Object.values(income);
  const mark = Array(keys.length).fill("?");
  const sql = `INSERT INTO incomes (${keys.join(", ")}) VALUES (${mark.join(", ")}) RETURNING *`;
  const id = uuid();
  const params = [id, ...values, userId];
  database.get(sql, params, (err, row: IIncomeResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, row);
  });
}

export function getSelfIncomesService(
  userId: string,
  offset = "0",
  limit = "10",
  init_date: string,
  end_date: string,
  group_by: string,
  callback: (err: Error | null, rows?: { data: IIncomeResponse[]; totals: unknown }) => void,
  fund_alias?: string
) {
  const fundFilter = fund_alias ? `AND i.fund_alias = '${fund_alias}'` : "";
  const dateFilter =
    init_date && end_date ? `AND updated_at BETWEEN '${init_date}' AND '${end_date}'` : "";
  const groupFilter = group_by ? `GROUP BY i.${group_by}` : "";

  // SELECT: returns all incomes
  // LEFT JOIN: returns transactions fields based on fund
  // LAG: get the previous line price
  // t.bought_at: returns the most recent transaction for each fund
  const sql = `SELECT 
    i.*, 
    t.quantity,
    (i.price * t.quantity) AS patrimony,
    (i.price - LAG(i.price) OVER (PARTITION BY i.fund_alias ORDER BY i.updated_at)) AS variation
FROM incomes i
LEFT JOIN transactions t
ON i.fund_alias = t.fund_alias
AND 
    t.bought_at = (
        SELECT MAX(t2.bought_at)
        FROM transactions t2
        WHERE t2.fund_alias = i.fund_alias
        AND t2.bought_at <= i.updated_at
    )
WHERE i.user_id = '${userId}' ${fundFilter} ${dateFilter}     
ORDER BY i.updated_at
LIMIT ${limit} OFFSET ${offset}
`;

  const countSql = `SELECT COUNT (*) AS count
  FROM incomes i
  WHERE user_id = '${userId}' ${fundFilter} ${dateFilter}
  `;

  database.all(sql, function (err, rows: IIncomeResponse[]) {
    if (err) return callback(new AppError(err.message, 400));
    const incomes = rows.map(({ user_id, ...rest }) => rest);
    database.get(countSql, function (err, totals) {
      if (err) return callback(new AppError(err.message, 400));
      callback(null, { data: incomes, totals });
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
  FROM incomes 
  WHERE user_id = '${userId}' ${dateFilter} ${fundFilter}
  GROUP BY strftime('%Y-%m', updated_at)
  `;

  const profitSql = `WITH FirstValuePerMonth AS (
  SELECT fund_alias,
    strftime('%Y-%m', updated_at) AS year_month,
    price,
    quantity,
    ROW_NUMBER() OVER (PARTITION BY fund_alias, strftime('%Y-%m', updated_at) ORDER BY updated_at) AS row_num
  FROM incomes
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

  database.all(sql, function (err, rows: IIncomeProfit[]) {
    if (err) return callback(new AppError(err.message, 400));
    database.all(profitSql, function (err, totals: IIncomeProfit[]) {
      if (err) return callback(new AppError(err.message, 400));
      const incomes = rows.map((income) => {
        const total = totals.find((t) => t.year_month === income.year_month);
        return {
          year_month: income.year_month,
          sum_incomes: income.sum_incomes,
          sum_patrimony: total ? total.sum_patrimony : null,
        };
      });

      callback(null, incomes);
    });
  });
}

export function getSelfPatrimonyByTypeService(
  userId: string,
  callback: (err: Error | null, rows?: unknown) => void
) {
  const sql = `SELECT
  funds.type,
  SUM(incomes.price * incomes.quantity) AS sum_patrimony
FROM
  incomes
  INNER JOIN funds ON incomes.fund_alias = funds.alias
WHERE
  user_id = '${userId}'
GROUP BY
  funds.type
  `;
  database.all(sql, function (err, rows: IIncomeProfit[]) {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, rows);
  });
}

export function updateIncomeService(
  id: string,
  userId: string,
  income: IIncomePatchRequest,
  callback: (err: Error | null, row?: IIncomePatchRequest) => void
) {
  const isEmpty = Object.keys(income).length === 0;
  if (isEmpty) return callback(new AppError("Missing fields", 400));

  if (!id) return callback(new AppError("Missing id", 400));

  const keys = [...Object.keys(income), "user_id"];
  const values = [...Object.values(income), userId];
  const query = keys.map((el) => `${el} = ?`);
  const sql = `UPDATE incomes SET ${query.join(",")} WHERE id = ? RETURNING *`;
  const params = [...values, id];
  database.get(sql, params, (err, row: IIncomeResponse) => {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, row);
  });
}

export function deleteIncomeService(
  id: string,
  callback: (err: Error | null, row?: unknown) => void
) {
  const sql = "DELETE FROM incomes WHERE id = ?";
  const params = [id];
  database.run(sql, params, function (err) {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, { deleted: !!this.changes });
  });
}
