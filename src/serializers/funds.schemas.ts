import { boolean, object, Schema, string } from "yup";
import { IFundPatchRequest, IFundRequest } from "../interfaces";

export const createFundSchema: Schema<IFundRequest> = object().shape({
  alias: string().max(10).required(),
  name: string().max(50).required(),
  description: string().max(200),
  type: string().max(10).required(),
  sector: string().max(50),
});

export const updateFundSchema: Schema<IFundPatchRequest> = object().shape({
  alias: string().max(10),
  name: string().max(50),
  description: string().max(200),
  type: string().max(10),
  sector: string().max(50),
});
