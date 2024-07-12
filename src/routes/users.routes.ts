import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getUsersController,
  retrieveUserController,
  updateUserController,
} from "../controllers/users.controllers";
import { userExistsMiddleware, userNotFoundMiddleware } from "../middlewares/users.middlewares";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import { createUserSchema, updateUserSchema } from "../serializers/users.schemas";
import { authUserMiddleware } from "../middlewares/authUserMiddleware";

const userRoutes = Router();

userRoutes.post(
  "",
  dataValidateMiddleware(createUserSchema),
  userExistsMiddleware,
  createUserController
);
userRoutes.get("", authUserMiddleware, getUsersController);
userRoutes.get("/:id", authUserMiddleware, userNotFoundMiddleware, retrieveUserController);
userRoutes.patch(
  "/:id",
  authUserMiddleware,
  dataValidateMiddleware(updateUserSchema),
  userNotFoundMiddleware,
  updateUserController
);
userRoutes.delete("/:id", authUserMiddleware, userNotFoundMiddleware, deleteUserController);

export default userRoutes;
