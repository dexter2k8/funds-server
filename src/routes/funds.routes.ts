import { Router } from "express";
import {
  createFundController,
  deleteFundController,
  getFundsController,
  retrieveFundController,
  updateFundController,
} from "../controllers/funds.controllers";
import { authUserMiddleware } from "../middlewares/authUserMiddleware";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import { createFundSchema, updateFundSchema } from "../serializers/funds.schemas";
import {
  fundAlreadyRegisteredMiddleware,
  fundNotFoundMiddleware,
} from "../middlewares/funds.middlewares";
import { isAdminMiddleware } from "../middlewares/users.middlewares";

const fundRoutes = Router();

fundRoutes.post(
  "",
  authUserMiddleware,
  dataValidateMiddleware(createFundSchema),
  fundAlreadyRegisteredMiddleware,
  createFundController
);
fundRoutes.get("", authUserMiddleware, getFundsController);
fundRoutes.get("/:alias", authUserMiddleware, fundNotFoundMiddleware, retrieveFundController);
fundRoutes.patch(
  "/:alias",
  authUserMiddleware,
  isAdminMiddleware,
  dataValidateMiddleware(updateFundSchema),
  fundNotFoundMiddleware,
  updateFundController
);
fundRoutes.delete(
  "/:alias",
  authUserMiddleware,
  isAdminMiddleware,
  fundNotFoundMiddleware,
  deleteFundController
);

export default fundRoutes;
