import { NextFunction, Request, Response } from "express";
import { createUserService } from "../services/users.services";
import { AppError } from "../errors/appError";

export const createUserController = (req: Request, res: Response, next: NextFunction) => {
  createUserService(req.body, (err, rows) => {
    if (err) return next(err);
    res.status(201).json(rows);
  });
};
