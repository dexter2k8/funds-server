import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import "dotenv/config";

declare global {
  namespace Express {
    interface Request {
      userId?: {
        id: string;
      };
    }
  }
}

export function authUserMiddleware(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).json({ message: "Missing authorization header" });

  const token = authorization.split(" ")[1];

  return verify(token, process.env.SECRET_KEY as string, (err, decoded: any) => {
    if (err) return res.status(401).json({ message: err.message });
    req.userId = { id: decoded.id };
    return next();
  });
}
