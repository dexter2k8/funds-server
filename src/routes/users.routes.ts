import { Router } from "express";
import {
  createUserController,
  getUsersController,
  retrieveUserController,
  updateUserController,
} from "../controllers/users.controllers";
import { userExistsMiddleware, userNotFoundMiddleware } from "../middlewares/users.middlewares";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import { createUserSchema } from "../serializers/users.schemas";

const userRoutes = Router();

userRoutes.post(
  "",
  dataValidateMiddleware(createUserSchema),
  userExistsMiddleware,
  createUserController
);
userRoutes.get("", getUsersController);
userRoutes.get("/:id", userNotFoundMiddleware, retrieveUserController);
userRoutes.patch("/:id", userNotFoundMiddleware, updateUserController);

export default userRoutes;
