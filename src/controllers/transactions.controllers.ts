import { NextFunction, Request, Response } from "express";
import {
  createTransactionService,
  deleteTransactionService,
  getLatestTransactionsService,
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
  const { offset, limit, group_by, fund_alias } = req.query as {
    offset: string;
    limit: string;
    group_by: string;
    fund_alias: string;
  };
  getSelfTransactionsService(
    req.user!.id,
    offset,
    limit,
    (err, rows) => {
      if (err) return res.status(400).json(err);
      res.status(200).json(rows);
    },
    group_by,
    fund_alias
  );
};

export const getLatestTransactionsController = (req: Request, res: Response) => {
  const { offset, limit, fund_alias } = req.query as {
    offset: string;
    limit: string;
    fund_alias: string;
  };
  getLatestTransactionsService(
    req.user!.id,
    offset,
    limit,
    (err, rows) => {
      if (err) return res.status(400).json(err);
      res.status(200).json(rows);
    },
    fund_alias
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
