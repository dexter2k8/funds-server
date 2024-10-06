import { loginService } from "../services/login.services";
import { NextFunction, Request, Response } from "express";

export function loginController(req: Request, res: Response, next: NextFunction) {
  loginService(req.body, (err, token) => {
    if (err) return next(err);
    res.status(200).json({ token });
  });
}
