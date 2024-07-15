import { object, Schema, string, number, date } from "yup";
import { ITransactionPatchRequest, ITransactionRequest } from "../interfaces";

export const createTransactionSchema: Schema<ITransactionRequest> = object().shape({
  price: number().required(),
  updated_at: date().required(),
  quantity: number().integer().required(),
  income: number(),
  fund_alias: string().required(),
});

export const updateTransactionSchema: Schema<ITransactionPatchRequest> = object().shape({
  price: number(),
  updated_at: date(),
  quantity: number().integer(),
  income: number(),
  fund_alias: string(),
});
