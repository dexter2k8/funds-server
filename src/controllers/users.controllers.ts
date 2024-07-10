import { NextFunction, Request, Response } from "express";
import { createUserService, getUsersService } from "../services/users.services";
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
