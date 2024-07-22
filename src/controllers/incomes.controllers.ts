import { NextFunction, Request, Response } from "express";
import {
  createIncomeService,
  deleteIncomeService,
  getSelfPatrimonyByTypeService,
  getSelfProfitsService,
  getSelfIncomesService,
  updateIncomeService,
  getSelfProfitsByFundService,
} from "../services/incomes.services";

export const createIncomeController = (req: Request, res: Response, next: NextFunction) => {
  createIncomeService(req.user!.id, req.body, (err, rows) => {
    if (err) return next(err);
    res.status(201).json(rows);
  });
};

export const getSelfIncomesController = (req: Request, res: Response) => {
  const { offset, limit, init_date, end_date, group_by } = req.query as {
    offset: string;
    limit: string;
    init_date: string;
    end_date: string;
    group_by: string;
  };
  const fund_alias = req.params.fund_alias;

  getSelfIncomesService(
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
    fund_alias
  );
};

export const getSelfProfitsController = (req: Request, res: Response) => {
  const { init_date, end_date } = req.query as {
    init_date: string;
    end_date: string;
  };
  getSelfProfitsService(req.user!.id, init_date, end_date, (err, rows) => {
    if (err) return res.status(400).json(err);
    res.status(200).json(rows);
  });
};

export const getSelfProfitsByFundController = (req: Request, res: Response) => {
  const { init_date, end_date } = req.query as {
    init_date: string;
    end_date: string;
  };
  const user_id = req.user!.id;
  const fund_alias = req.params.fund_alias;
  getSelfProfitsByFundService(user_id, init_date, end_date, fund_alias, (err, rows) => {
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

export const updateIncomeController = (req: Request, res: Response, next: NextFunction) => {
  updateIncomeService(req.params.id, req.user!.id, req.body, (err, row) => {
    if (err) return next(err);
    res.status(200).json(row);
  });
};

export const deleteIncomeController = (req: Request, res: Response, next: NextFunction) => {
  deleteIncomeService(req.params.id, (err, row) => {
    if (err) return next(err);
    res.status(204).json(row);
  });
};
