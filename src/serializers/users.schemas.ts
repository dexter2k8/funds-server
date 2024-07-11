import { object, Schema, string } from "yup";
import { IUserPatchRequest, IUserRequest } from "../interfaces";

export const createUserSchema: Schema<IUserRequest> = object().shape({
  name: string().min(3).max(50).required(),
  email: string().email().required(),
  password: string().min(6).required(),
});

export const updateUserSchema: Schema<IUserPatchRequest> = object().shape({
  name: string().min(3).max(50),
  email: string().email(),
  password: string().min(6),
});
