import { Router } from "express";
import { authUserMiddleware } from "../middlewares/authUserMiddleware";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../serializers/transactions.schemas";
import {
  createTransactionController,
  getSelfTransactionsController,
  updateTransactionController,
} from "../controllers/transactions.controllers";
import { fundExistsMiddleware } from "../middlewares/fundExists.middleware";
import { transactionNotOwnerMiddleware } from "../middlewares/transactions.middlewares";

const transactionsRoutes = Router();

transactionsRoutes.post(
  "",
  authUserMiddleware,
  dataValidateMiddleware(createTransactionSchema),
  fundExistsMiddleware,
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
