import database from "../data-source";
import { AppError } from "../errors/appError";
import { ILoginRequest, IUserPatchRequest, IUserResponse } from "../interfaces";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import "dotenv/config";

export async function loginService(
  { email, password }: ILoginRequest,
  callback: (err: Error | null, token?: string) => void
) {
  const sql = "SELECT * FROM users WHERE email = ?";
  const params = [email];
  const getPromise = (sql: string, params: string[]): Promise<IUserResponse> => {
    return new Promise((resolve, reject) => {
      database.get(sql, params, function (err, row: IUserResponse) {
        if (err) return reject(err);
        if (!row) return reject(new AppError("Invalid user/password", 400));
        resolve(row);
      });
    });
  };
  const user = await getPromise(sql, params);

  const passwordMatch = await compare(password, user.password!);
  if (!passwordMatch) return callback(new AppError("Invalid user/password", 400));

  const token = sign({ id: user.id }, process.env.SECRET_KEY!, { expiresIn: "1d" });

  callback(null, token);
}
