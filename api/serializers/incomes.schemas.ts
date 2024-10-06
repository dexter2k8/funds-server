import { object, Schema, string, number, date } from "yup";
import { IIncomePatchRequest, IIncomeRequest } from "../interfaces";

export const createIncomeSchema: Schema<IIncomeRequest> = object().shape({
  price: number().required(),
  updated_at: string().matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid updated_at format (YYYY-MM-DD)",
  }),
  income: number(),
  fund_alias: string().required(),
});

export const updateIncomeSchema: Schema<IIncomePatchRequest> = object().shape({
  price: number(),
  updated_at: string().matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid updated_at format (YYYY-MM-DD)",
  }),
  income: number(),
  fund_alias: string(),
});
