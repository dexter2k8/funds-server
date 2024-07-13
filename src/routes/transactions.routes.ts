import { Router } from "express";
import { createTransactionController } from "../controllers/transactions.controllers";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import { createTransactionSchema } from "../serializers/transactions.schemas";
import { transactionFundExistsMiddleware } from "../middlewares/transactions.middlewares";
import { authUserMiddleware } from "../middlewares/authUserMiddleware";

const transactionsRoutes = Router();

transactionsRoutes.post(
  "",
  authUserMiddleware,
  dataValidateMiddleware(createTransactionSchema),
  transactionFundExistsMiddleware,
  createTransactionController
);

export default transactionsRoutes;
