import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getUsersController,
  retrieveSelfUserController,
  retrieveUserController,
  updateSelfUserController,
  updateUserController,
} from "../controllers/users.controllers";
import {
  isAdminMiddleware,
  userExistsMiddleware,
  userNotFoundMiddleware,
} from "../middlewares/users.middlewares";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import {
  createUserSchema,
  updateSelfUserSchema,
  updateUserSchema,
} from "../serializers/users.schemas";
import { authUserMiddleware } from "../middlewares/authUserMiddleware";

const userRoutes = Router();

userRoutes.post(
  "",
  dataValidateMiddleware(createUserSchema),
  userExistsMiddleware,
  createUserController
);
userRoutes.get("", authUserMiddleware, isAdminMiddleware, getUsersController);
userRoutes.get("/self-user", authUserMiddleware, retrieveSelfUserController);
userRoutes.get(
  "/:id",
  authUserMiddleware,
  isAdminMiddleware,
  userNotFoundMiddleware,
  retrieveUserController
);
userRoutes.patch(
  "",
  authUserMiddleware,
  dataValidateMiddleware(updateSelfUserSchema),
  updateSelfUserController
);
userRoutes.patch(
  "/:id",
  authUserMiddleware,
  isAdminMiddleware,
  dataValidateMiddleware(updateUserSchema),
  userNotFoundMiddleware,
  updateUserController
);
userRoutes.delete(
  "/:id",
  authUserMiddleware,
  isAdminMiddleware,
  userNotFoundMiddleware,
  deleteUserController
);

export default userRoutes;
