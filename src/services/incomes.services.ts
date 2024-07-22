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
ORDER BY i.updated_at DESC
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
  init_date: string,
  end_date: string,
  callback: (err: Error | null, rows?: unknown) => void
) {
  // CTE 'DateRange': Get all the months between 'init_date' and 'end_date'
  //                  Use the recursive function to add a month at each iteration.
  // CTE 'LatestIncomesPerMonth': Get the month end and group it with fund_alias
  //                              To find the most recent updated_at
  // CTE 'MonthlySums': Get the total income and patrimony for each month
  const sql = `
  WITH DateRange AS (
    SELECT DATE('${init_date}') AS month_start
    UNION ALL
    SELECT DATE(month_start, '+1 month')
    FROM DateRange
    WHERE DATE(month_start, '+1 month') <= '${end_date}'
),
LatestIncomesPerMonth AS (
    SELECT
        DATE(month_start, 'start of month', '+1 month', '-1 day') AS month_end,
        i.fund_alias,
        MAX(i.updated_at) AS max_updated_at
    FROM
        DateRange dr
    JOIN
        incomes i ON i.updated_at <= DATE(dr.month_start, 'start of month', '+1 month', '-1 day')
    GROUP BY
        month_end,
        i.fund_alias
),
MonthlySums AS (
    SELECT
        strftime('%Y-%m', lim.month_end) AS year_month,
        SUM(i.price * t.quantity) AS total_patrimony,
        SUM(CASE WHEN strftime('%Y-%m', i.updated_at) = strftime('%Y-%m', lim.month_end) THEN i.income ELSE 0 END) AS total_income
    FROM
        LatestIncomesPerMonth lim
    JOIN
        incomes i ON lim.fund_alias = i.fund_alias AND lim.max_updated_at = i.updated_at
        AND i.user_id = '${userId}'
    LEFT JOIN 
        transactions t ON i.fund_alias = t.fund_alias
    AND t.bought_at = (
        SELECT MAX(t2.bought_at)
        FROM transactions t2
        WHERE t2.fund_alias = i.fund_alias
        AND t2.bought_at <= i.updated_at
    )
    GROUP BY
        year_month
)
SELECT
    year_month,
    total_patrimony,
    total_income
FROM
    MonthlySums
ORDER BY
    year_month
  `;
  database.all(sql, function (err, rows: unknown) {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, rows);
  });
}

export function getSelfProfitsByFundService(
  userId: string,
  init_date: string,
  end_date: string,
  fund_alias: string,
  callback: (err: Error | null, rows?: unknown) => void
) {
  const fundFilter = fund_alias ? `AND i.fund_alias = '${fund_alias}'` : "";
  const dateFilter =
    init_date && end_date ? `AND updated_at BETWEEN '${init_date}' AND '${end_date}'` : "";
  // Get the total income and patrimony of a fund for each month
  const sql = `SELECT
  strftime('%Y-%m', i.updated_at) AS year_month,
  SUM(i.price * t.quantity) AS total_patrimony,
  SUM(i.income) AS total_income
FROM 
  incomes i
LEFT JOIN 
  transactions t
ON 
  i.fund_alias = t.fund_alias
AND 
  t.bought_at = (
      SELECT MAX(t2.bought_at)
      FROM transactions t2
      WHERE t2.fund_alias = i.fund_alias
      AND t2.bought_at <= i.updated_at
  )        
WHERE
  i.user_id = '${userId}' ${fundFilter} ${dateFilter}
GROUP BY
  strftime('%Y-%m', i.updated_at)
ORDER BY
  year_month;  
`;
  database.all(sql, function (err, rows: unknown) {
    if (err) return callback(new AppError(err.message, 400));
    callback(null, rows);
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
