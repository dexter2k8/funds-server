import { NextFunction, Request, Response } from "express";
import {
  createTransactionService,
  deleteTransactionService,
  getSelfPatrimonyByTypeService,
  getSelfProfitsService,
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
  const { offset, limit, init_date, end_date, group_by } = req.query as {
    offset: string;
    limit: string;
    init_date: string;
    end_date: string;
    group_by: string;
  };
  getSelfTransactionsService(
    req.user!.id,
    offset,
    limit,
    init_date,
    end_date,
    group_by,
    (err, rows) => {
      if (err) return res.status(400).json(err);
      res.status(200).json(rows);
    }
  );
};

export const getSelfTransactionFundController = (req: Request, res: Response) => {
  const { offset, limit, init_date, end_date, group_by } = req.query as {
    offset: string;
    limit: string;
    init_date: string;
    end_date: string;
    group_by: string;
  };
  getSelfTransactionsService(
    req.user!.id,
    offset,
    limit,
    init_date,
    end_date,
    group_by,
    (err, rows) => {
      if (err) return res.status(400).json(err);
      res.status(200).json(rows);
    },
    req.params.fundAlias
  );
};

export const getSelfProfitsController = (req: Request, res: Response) => {
  const { fund_alias, init_date, end_date } = req.query as {
    fund_alias: string;
    init_date: string;
    end_date: string;
  };
  getSelfProfitsService(req.user!.id, fund_alias, init_date, end_date, (err, rows) => {
    if (err) return res.status(400).json(err);
    res.status(200).json(rows);
  });
};

export const getSelfPatrimonyByTypeController = (req: Request, res: Response) => {
  getSelfPatrimonyByTypeService(req.user!.id, (err, rows) => {
    if (err) return res.status(400).json(err);
    res.status(200).json(rows);
  });
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
