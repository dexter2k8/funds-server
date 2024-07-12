import database from "../data-source";
import { AppError } from "../errors/appError";
import { ILoginRequest, IUserPatchRequest, IUserResponse } from "../interfaces";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { promisify } from "util";
import "dotenv/config";

export async function loginService(
  { email, password }: ILoginRequest,
  callback: (err: Error | null, token?: string) => void
) {
  const sql = `SELECT * FROM users WHERE email = '${email}'`;

  const getPromise = promisify(database.get).bind(database);
  const user = (await getPromise(sql)) as IUserResponse;
  if (!user) return callback(new AppError("Invalid user/password", 400));

  const passwordMatch = await compare(password, user.password!);
  if (!passwordMatch) return callback(new AppError("Invalid user/password", 400));

  const token = sign({ id: user.id }, process.env.SECRET_KEY as string, { expiresIn: "1d" });

  callback(null, token);
}
