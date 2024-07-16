import { object, Schema, string, number, date } from "yup";
import { ITransactionPatchRequest, ITransactionRequest } from "../interfaces";

export const createTransactionSchema: Schema<ITransactionRequest> = object().shape({
  price: number().required(),
  updated_at: string().matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid updated_at format (YYYY-MM-DD)",
  }),
  quantity: number().integer().required(),
  income: number(),
  fund_alias: string().required(),
});

export const updateTransactionSchema: Schema<ITransactionPatchRequest> = object().shape({
  price: number(),
  updated_at: string().matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid updated_at format (YYYY-MM-DD)",
  }),
  quantity: number().integer(),
  income: number(),
  fund_alias: string(),
});
