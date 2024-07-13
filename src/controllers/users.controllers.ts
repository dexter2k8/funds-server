import { NextFunction, Request, Response } from "express";
import {
  createUserService,
  deleteUserService,
  getUsersService,
  retrieveUserService,
  updateUserService,
} from "../services/users.services";
import { AppError } from "../errors/appError";

export const createUserController = (req: Request, res: Response, next: NextFunction) => {
  createUserService(req.body, (err, rows) => {
    if (err) return next(err);
    res.status(201).json(rows);
  });
};

export const getUsersController = (req: Request, res: Response) => {
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || 10;
  getUsersService(offset, limit, (err, rows) => {
    if (err) return res.status(400).json(err);
    res.status(200).json(rows);
  });
};

export const retrieveUserController = (req: Request, res: Response, next: NextFunction) => {
  retrieveUserService(req.params.id, (err, row) => {
    if (err) return next(err);
    res.status(200).json(row);
  });
};

export const retrieveSelfUserController = (req: Request, res: Response, next: NextFunction) => {
  retrieveUserService(req.user!.id, (err, row) => {
    if (err) return next(err);
    res.status(200).json(row);
  });
};

export const updateUserController = (req: Request, res: Response, next: NextFunction) => {
  updateUserService(req.params.id, req.body, (err, row) => {
    if (err) return next(err);
    res.status(200).json(row);
  });
};

export const updateSelfUserController = (req: Request, res: Response, next: NextFunction) => {
  updateUserService(req.user!.id, req.body, (err, row) => {
    if (err) return next(err);
    res.status(200).json(row);
  });
};

export const deleteUserController = (req: Request, res: Response, next: NextFunction) => {
  deleteUserService(req.params.id, (err, row) => {
    if (err) return next(err);
    res.status(204).json(row);
  });
};
