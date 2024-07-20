import { Request, Response, NextFunction } from "express";
import database from "../data-source";

export function fundExistsMiddleware(req: Request, res: Response, next: NextFunction) {
  const { fundAlias } = req.params;
  const { fund_alias } = req.body;
  const sql = "SELECT COUNT (*) AS count FROM funds WHERE alias = ?";
  const params = [fundAlias || fund_alias];
  database.get(sql, params, (err, row: { count: number }) => {
    if (err) return res.status(400).json(err);
    else if (!row.count) res.status(404).json({ message: "Fund not found" });
    else next();
  });
}
