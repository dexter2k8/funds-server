import { Request, Response, NextFunction } from "express";
import database from "../data-source";

export function userExistsMiddleware(req: Request, res: Response, next: NextFunction) {
  const sql = "SELECT COUNT (*) AS count FROM users WHERE email = ?";
  const params = req.body?.email;
  database.get(sql, params, (err, row: { count: number }) => {
    if (err) return res.status(400).json(err);
    else if (row.count) res.status(409).json({ message: "User already registered" });
    else next();
  });
}

export function userNotFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  const sql = "SELECT COUNT (*) AS count FROM users WHERE id = ?";
  const params = req.params.id;
  database.get(sql, params, (err, row: { count: number }) => {
    if (err) return res.status(400).json(err);
    else if (!row.count) res.status(404).json({ message: "User not found" });
    else next();
  });
}
