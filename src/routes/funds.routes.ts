import { Router } from "express";
import {
  createFundController,
  getFundsController,
  retrieveFundController,
  updateFundController,
} from "../controllers/funds.controllers";
import { authUserMiddleware } from "../middlewares/authUserMiddleware";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import { createFundSchema, updateFundSchema } from "../serializers/funds.schemas";
import { fundExistsMiddleware, fundNotFoundMiddleware } from "../middlewares/funds.middlewares";
import { isAdminMiddleware } from "../middlewares/users.middlewares";

const fundRoutes = Router();

fundRoutes.post(
  "",
  dataValidateMiddleware(createFundSchema),
  authUserMiddleware,
  fundExistsMiddleware,
  createFundController
);
fundRoutes.get("", authUserMiddleware, getFundsController);
fundRoutes.get("/:id", authUserMiddleware, fundNotFoundMiddleware, retrieveFundController);
fundRoutes.patch(
  "/:id",
  authUserMiddleware,
  isAdminMiddleware,
  dataValidateMiddleware(updateFundSchema),
  fundNotFoundMiddleware,
  updateFundController
);

export default fundRoutes;
