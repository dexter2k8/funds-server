import { boolean, object, Schema, string } from "yup";
import { ISelfUserPatchRequest, IUserPatchRequest, IUserRequest } from "../interfaces";

export const createUserSchema: Schema<IUserRequest> = object().shape({
  name: string().min(3).max(50).required(),
  email: string().email().required(),
  password: string().min(6).required(),
  admin: boolean(),
});

export const updateUserSchema: Schema<IUserPatchRequest> = object().shape({
  name: string().min(3).max(50),
  email: string().email(),
  password: string().min(6),
  admin: boolean(),
});

export const updateSelfUserSchema: Schema<ISelfUserPatchRequest> = object().shape({
  name: string().min(3).max(50),
  email: string().email(),
  password: string().min(6),
});
