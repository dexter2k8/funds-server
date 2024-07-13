import { object, Schema, string, number, date } from "yup";
import { ITransactionPatchRequest, ITransactionRequest } from "../interfaces";

export const createTransactionSchema: Schema<ITransactionRequest> = object().shape({
  value: number().required(),
  date: date().required(),
  quantity: number().integer().required(),
  income: number(),
  fund_alias: string().required(),
});

export const updateTransactionSchema: Schema<ITransactionPatchRequest> = object().shape({
  value: number(),
  date: date(),
  quantity: number().integer(),
  income: number(),
  fund_alias: string(),
});
