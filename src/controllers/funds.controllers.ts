import { NextFunction, Request, Response } from "express";
import { createFundService, getFundsService } from "../services/funds.services";

export const createFundController = (req: Request, res: Response, next: NextFunction) => {
  createFundService(req.body, (err, rows) => {
    if (err) return next(err);
    res.status(201).json(rows);
  });
};

export const getFundsController = (req: Request, res: Response) => {
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || 10;
  getFundsService(offset, limit, (err, rows) => {
    if (err) return res.status(400).json(err);
    res.status(200).json(rows);
  });
};
