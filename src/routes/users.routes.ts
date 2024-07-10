import { Router } from "express";
import { createUserController } from "../controllers/users.controllers";
import { userExistsMiddleware } from "../middlewares/users.middlewares";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import { createUserSchema } from "../serializers/users.schemas";

const userRoutes = Router();

userRoutes.post(
  "",
  dataValidateMiddleware(createUserSchema),
  userExistsMiddleware,
  createUserController
);

export default userRoutes;
