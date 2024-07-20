import { Router } from "express";
import { authUserMiddleware } from "../middlewares/authUserMiddleware";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import { createTransactionSchema } from "../serializers/transactions.schemas";
import { createTransactionController } from "../controllers/transactions.controllers";
import { fundExistsMiddleware } from "../middlewares/fundExists.middleware";

const transactionsRoutes = Router();

transactionsRoutes.post(
  "",
  authUserMiddleware,
  dataValidateMiddleware(createTransactionSchema),
  fundExistsMiddleware,
  createTransactionController
);

export default transactionsRoutes;
