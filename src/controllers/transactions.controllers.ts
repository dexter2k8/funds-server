import { NextFunction, Request, Response } from "express";
import {
  createTransactionService,
  deleteTransactionService,
  getSelfTransactionsService,
  updateTransactionService,
} from "../services/transactions.services";

export const createTransactionController = (req: Request, res: Response, next: NextFunction) => {
  createTransactionService(req.user!.id, req.body, (err, rows) => {
    if (err) return next(err);
    res.status(201).json(rows);
  });
};

export const getSelfTransactionsController = (req: Request, res: Response) => {
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || 10;
  getSelfTransactionsService(req.user!.id, offset, limit, (err, rows) => {
    if (err) return res.status(400).json(err);
    res.status(200).json(rows);
  });
};

export const getSelfTransactionFundController = (req: Request, res: Response) => {
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || 10;
  getSelfTransactionsService(
    req.user!.id,
    offset,
    limit,
    (err, rows) => {
      if (err) return res.status(400).json(err);
      res.status(200).json(rows);
    },
    req.params.fundAlias
  );
};

export const updateTransactionController = (req: Request, res: Response, next: NextFunction) => {
  updateTransactionService(req.params.id, req.user!.id, req.body, (err, row) => {
    if (err) return next(err);
    res.status(200).json(row);
  });
};

export const deleteTransactionController = (req: Request, res: Response, next: NextFunction) => {
  deleteTransactionService(req.params.id, (err, row) => {
    if (err) return next(err);
    res.status(204).json(row);
  });
};
