import { Router } from "express";
import { createFundController, getFundsController } from "../controllers/funds.controllers";
import { authUserMiddleware } from "../middlewares/authUserMiddleware";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import { createFundSchema } from "../serializers/funds.schemas";
import { fundExistsMiddleware } from "../middlewares/funds.middlewares";

const fundRoutes = Router();

fundRoutes.post(
  "",
  dataValidateMiddleware(createFundSchema),
  authUserMiddleware,
  fundExistsMiddleware,
  createFundController
);
fundRoutes.get("", authUserMiddleware, getFundsController);

export default fundRoutes;
