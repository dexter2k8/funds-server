import { Router } from "express";
import {
  createTransactionController,
  getSelfTransactionsController,
  updateTransactionController,
} from "../controllers/transactions.controllers";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../serializers/transactions.schemas";
import {
  transactionFundExistsMiddleware,
  transactionNotOwnerMiddleware,
} from "../middlewares/transactions.middlewares";
import { authUserMiddleware } from "../middlewares/authUserMiddleware";

const transactionsRoutes = Router();

transactionsRoutes.post(
  "",
  authUserMiddleware,
  dataValidateMiddleware(createTransactionSchema),
  transactionFundExistsMiddleware,
  createTransactionController
);
transactionsRoutes.get("", authUserMiddleware, getSelfTransactionsController);
transactionsRoutes.patch(
  "/:id",
  authUserMiddleware,
  dataValidateMiddleware(updateTransactionSchema),
  transactionNotOwnerMiddleware,
  updateTransactionController
);

export default transactionsRoutes;
