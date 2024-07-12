import { NextFunction, Request, Response } from "express";
import { createFundService } from "../services/funds.services";

export const createFundController = (req: Request, res: Response, next: NextFunction) => {
  createFundService(req.body, (err, rows) => {
    if (err) return next(err);
    res.status(201).json(rows);
  });
};
