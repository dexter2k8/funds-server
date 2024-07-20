import { object, Schema, string, number, date } from "yup";
import { ITransactionPatchRequest, ITransactionRequest } from "../interfaces";

export const createTransactionSchema: Schema<ITransactionRequest> = object().shape({
  price: number().required(),
  bought_at: string().matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid bought_at format (YYYY-MM-DD)",
  }),
  quantity: number(),
  fund_alias: string().required(),
});

export const updateTransactionSchema: Schema<ITransactionPatchRequest> = object().shape({
  price: number(),
  bought_at: string().matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Invalid bought_at format (YYYY-MM-DD)",
  }),
  quantity: number(),
  fund_alias: string(),
});
