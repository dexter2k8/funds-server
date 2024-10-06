import { Request, Response, NextFunction } from "express";
import database from "../data-source";

export function fundAlreadyRegisteredMiddleware(req: Request, res: Response, next: NextFunction) {
  const sql = "SELECT COUNT (*) AS count FROM funds WHERE alias = ?";
  const params = req.body?.alias;
  database.get(sql, params, (err, row: { count: number }) => {
    if (err) return res.status(400).json(err);
    else if (row.count) res.status(409).json({ message: "Fund already registered" });
    else next();
  });
}

export function fundNotFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  const sql = "SELECT COUNT (*) AS count FROM funds WHERE alias = ?";
  const params = req.params.alias;
  database.get(sql, params, (err, row: { count: number }) => {
    if (err) return res.status(400).json(err);
    else if (!row.count) res.status(404).json({ message: "Fund not found" });
    else next();
  });
}
