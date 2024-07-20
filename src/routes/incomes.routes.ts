import { Router } from "express";
import {
  createIncomeController,
  deleteIncomeController,
  getSelfPatrimonyByTypeController,
  getSelfProfitsController,
  getSelfIncomesFundController,
  getSelfIncomesController,
  updateIncomeController,
} from "../controllers/incomes.controllers";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import { createIncomeSchema, updateIncomeSchema } from "../serializers/incomes.schemas";
import {
  incomeFundExistsMiddleware,
  incomeNotOwnerMiddleware,
} from "../middlewares/incomes.middlewares";
import { authUserMiddleware } from "../middlewares/authUserMiddleware";

const incomesRoutes = Router();

incomesRoutes.post(
  "",
  authUserMiddleware,
  dataValidateMiddleware(createIncomeSchema),
  incomeFundExistsMiddleware,
  createIncomeController
);
incomesRoutes.get("", authUserMiddleware, getSelfIncomesController);
incomesRoutes.get("/self-profits", authUserMiddleware, getSelfProfitsController);
incomesRoutes.get("/patrimony", authUserMiddleware, getSelfPatrimonyByTypeController);
incomesRoutes.get(
  "/:fundAlias",
  authUserMiddleware,
  incomeFundExistsMiddleware,
  getSelfIncomesFundController
);
incomesRoutes.patch(
  "/:id",
  authUserMiddleware,
  dataValidateMiddleware(updateIncomeSchema),
  incomeNotOwnerMiddleware,
  updateIncomeController
);
incomesRoutes.delete("/:id", authUserMiddleware, incomeNotOwnerMiddleware, deleteIncomeController);

export default incomesRoutes;
