import { object, Schema, string } from "yup";
import { ILoginRequest } from "../interfaces";

export const loginSchema: Schema<ILoginRequest> = object().shape({
  email: string().email().required(),
  password: string().min(6).required(),
});
