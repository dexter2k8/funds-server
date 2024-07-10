import { AnySchema } from "yup";
import { NextFunction, Request, Response } from "express";

export const dataValidateMiddleware =
  (schema: AnySchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validateData = await schema.validate(req.body, {
        stripUnknown: true,
        abortEarly: false,
      });
      return next();
    } catch (error: any) {
      return res.status(400).json({ message: error.errors });
    }
  };
