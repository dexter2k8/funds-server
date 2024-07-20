import { Request, Response, NextFunction } from "express";
import database from "../data-source";

export function incomeNotOwnerMiddleware(req: Request, res: Response, next: NextFunction) {
  const sql = "SELECT COUNT (*) AS count FROM incomes WHERE id = ? AND user_id = ?";
  const params = [req.params.id, req.user?.id];
  database.get(sql, params, (err, row: { count: number }) => {
    if (err) return res.status(400).json(err);
    else if (!row.count) res.status(403).json({ message: "Income not found or not owner" });
    else next();
  });
}
