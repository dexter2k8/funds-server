import { NextFunction, Request, Response } from "express";
import {
  createTransactionService,
  getSelfTransactionsService,
} from "../services/transactions.services";

export const createTransactionController = (req: Request, res: Response, next: NextFunction) => {
  createTransactionService(req.userId!.id, req.body, (err, rows) => {
    if (err) return next(err);
    res.status(201).json(rows);
  });
};

export const getSelfTransactionsController = (req: Request, res: Response) => {
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || 10;
  getSelfTransactionsService(req.userId!.id, offset, limit, (err, rows) => {
    if (err) return res.status(400).json(err);
    res.status(200).json(rows);
  });
};
