import { NextFunction, Request, Response } from "express";
import {
  createFundService,
  getFundsService,
  retrieveFundService,
  updateFundService,
} from "../services/funds.services";

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

export const retrieveFundController = (req: Request, res: Response, next: NextFunction) => {
  retrieveFundService(req.params.id, (err, row) => {
    if (err) return next(err);
    res.status(200).json(row);
  });
};

export const updateFundController = (req: Request, res: Response, next: NextFunction) => {
  updateFundService(req.params.id, req.body, (err, row) => {
    if (err) return next(err);
    res.status(200).json(row);
  });
};
