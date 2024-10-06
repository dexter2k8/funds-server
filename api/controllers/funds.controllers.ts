import { NextFunction, Request, Response } from "express";
import {
  createFundService,
  deleteFundService,
  getFundsService,
  getSelfFundsService,
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
  const { offset, limit } = req.query as { offset: string; limit: string };
  getFundsService(offset, limit, (err, rows) => {
    if (err) return res.status(400).json(err);
    res.status(200).json(rows);
  });
};

export const retrieveFundController = (req: Request, res: Response, next: NextFunction) => {
  retrieveFundService(req.params.alias, (err, row) => {
    if (err) return next(err);
    res.status(200).json(row);
  });
};

export const getSelfFundsController = (req: Request, res: Response, next: NextFunction) => {
  getSelfFundsService(req.user!.id, (err, rows) => {
    if (err) return next(err);
    res.status(200).json(rows);
  });
};

export const updateFundController = (req: Request, res: Response, next: NextFunction) => {
  updateFundService(req.params.alias, req.body, (err, row) => {
    if (err) return next(err);
    res.status(200).json(row);
  });
};

export const deleteFundController = (req: Request, res: Response, next: NextFunction) => {
  deleteFundService(req.params.alias, (err, row) => {
    if (err) return next(err);
    res.status(204).json(row);
  });
};
