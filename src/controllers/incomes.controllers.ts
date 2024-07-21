import { NextFunction, Request, Response } from "express";
import {
  createIncomeService,
  deleteIncomeService,
  getSelfPatrimonyByTypeService,
  getSelfProfitsService,
  getSelfIncomesService,
  updateIncomeService,
} from "../services/incomes.services";

export const createIncomeController = (req: Request, res: Response, next: NextFunction) => {
  createIncomeService(req.user!.id, req.body, (err, rows) => {
    if (err) return next(err);
    res.status(201).json(rows);
  });
};

export const getSelfIncomesController = (req: Request, res: Response) => {
  const { offset, limit, init_date, end_date, group_by, fund_alias } = req.query as {
    offset: string;
    limit: string;
    init_date: string;
    end_date: string;
    group_by: string;
    fund_alias: string;
  };
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

export const getSelfIncomesFundController = (req: Request, res: Response) => {
  const { offset, limit, init_date, end_date, group_by, fund_alias } = req.query as {
    offset: string;
    limit: string;
    init_date: string;
    end_date: string;
    group_by: string;
    fund_alias: string;
  };
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
