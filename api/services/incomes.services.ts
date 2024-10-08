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
  limit = "3000",
  init_date: string,
  end_date: string,
  callback: (err: Error | null, rows?: { data: IIncomeResponse[]; totals: unknown }) => void,
  fund_alias?: string
) {
  const fundFilter = fund_alias ? `AND i.fund_alias = '${fund_alias}'` : "";
  const dateFilter =
    init_date && end_date ? `AND updated_at BETWEEN '${init_date}' AND '${end_date}'` : "";
  // SELECT: returns all incomes
  // LEFT JOIN: returns transactions fields based on fund
  // LAG: get the previous line price for variation calculation
  // t.bought_at: returns the most recent transaction for each fund
  const sql = `SELECT 
    i.*, 
    (
        SELECT SUM(t.quantity)
        FROM transactions t
        WHERE t.fund_alias = i.fund_alias
          AND t.bought_at <= i.updated_at
    ) AS quantity,
    (i.price * (
        SELECT SUM(t.quantity)
        FROM transactions t
        WHERE t.fund_alias = i.fund_alias
          AND t.bought_at <= i.updated_at
    )) AS patrimony,
    (i.price - LAG(i.price) OVER (PARTITION BY i.fund_alias ORDER BY i.updated_at)) AS variation
FROM incomes i
WHERE i.user_id = '${userId}' ${fundFilter} ${dateFilter}
ORDER BY i.updated_at DESC
LIMIT ${limit} OFFSET ${offset};
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
  callback: (err: Error | null, rows?: unknown) => void,
  type?: string
) {
  const typeFilter = type ? `JOIN funds f ON i.fund_alias = f.alias WHERE f.type = '${type}'` : "";
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
        SUM(i.price * (
            SELECT SUM(t.quantity)
            FROM transactions t
            WHERE t.fund_alias = i.fund_alias
              AND t.bought_at <= lim.month_end
        )) AS total_patrimony,
        SUM(CASE WHEN strftime('%Y-%m', i.updated_at) = strftime('%Y-%m', lim.month_end) THEN i.income ELSE 0 END) AS total_income
    FROM
        LatestIncomesPerMonth lim
    JOIN
        incomes i ON lim.fund_alias = i.fund_alias AND lim.max_updated_at = i.updated_at
        AND i.user_id = '${userId}'
    ${typeFilter}
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
  SUM(i.price * (
      SELECT SUM(t.quantity)
      FROM transactions t
      WHERE t.fund_alias = i.fund_alias
        AND t.bought_at <= i.updated_at
  )) AS total_patrimony,
  SUM(i.income) AS total_income
FROM 
  incomes i
WHERE
  i.user_id = '${userId}' ${fundFilter} ${dateFilter}
GROUP BY
  strftime('%Y-%m', i.updated_at)
ORDER BY
  year_month  
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
  // CTE LatestIncomes: Get most recent record for each fund
  // LEFT JOIN: merge quantity from transactions with incomes price
  // AND t.max_bought_at   =: get nearest transaction for each fund (less or equal date)
  // COALESCE(li.quantity, 0): returns 0 if li.quantity is null
  // SELECT SUM() ...GROUP BY: get total patrimony grouped by fund type
  // monthly_income: get the sum of incomes for current month grouped by type
  const sql = `
 WITH LatestIncomes AS (
    SELECT
        i.fund_alias,
        i.price,
        i.updated_at,
        (
            SELECT SUM(t.quantity)
            FROM transactions t
            WHERE t.fund_alias = i.fund_alias
              AND t.bought_at <= i.updated_at
        ) AS quantity,
        (
            SELECT SUM(i2.income)
            FROM incomes i2
            WHERE i2.fund_alias = i.fund_alias
              AND strftime('%Y-%m', i2.updated_at) = strftime('%Y-%m', DATE('now', '-1 month'))
              AND i2.user_id = '${userId}'
        ) AS monthly_income
    FROM
        incomes i
    INNER JOIN (
        SELECT
            fund_alias,
            MAX(updated_at) AS max_updated_at
        FROM
            incomes
        WHERE
            user_id = '${userId}'
        GROUP BY
            fund_alias
    ) latest_incomes
    ON i.fund_alias = latest_incomes.fund_alias
    AND i.updated_at = latest_incomes.max_updated_at
)
SELECT
    f.type,
    SUM(li.price * COALESCE(li.quantity, 0)) AS total_patrimony,
    SUM(COALESCE(li.monthly_income, 0)) AS total_income
FROM
    LatestIncomes li
INNER JOIN
    funds f ON li.fund_alias = f.alias
GROUP BY
    f.type;
 
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
