import { Request, Response, NextFunction } from "express";
import database from "../data-source";
import { IUserResponse } from "../interfaces";

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

export function isAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  const sql = "SELECT * FROM users WHERE id = ?";
  const params = [req.userId?.id];
  database.get(sql, params, (err, row: IUserResponse) => {
    if (err) return res.status(400).json(err);
    if (row) delete row["password"];
    if (!row?.admin) return res.status(403).json({ message: "Unauthorized" });
    return next();
  });
}
