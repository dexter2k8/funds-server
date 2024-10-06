import { Router } from "express";
import {
  createIncomeController,
  deleteIncomeController,
  getSelfPatrimonyByTypeController,
  getSelfProfitsController,
  getSelfIncomesController,
  updateIncomeController,
  getSelfProfitsByFundController,
} from "../controllers/incomes.controllers";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import { createIncomeSchema, updateIncomeSchema } from "../serializers/incomes.schemas";
import { incomeNotOwnerMiddleware } from "../middlewares/incomes.middlewares";
import { authUserMiddleware } from "../middlewares/authUserMiddleware";
import { fundExistsMiddleware } from "../middlewares/fundExists.middleware";

const incomesRoutes = Router();

incomesRoutes.post(
  "",
  authUserMiddleware,
  dataValidateMiddleware(createIncomeSchema),
  fundExistsMiddleware,
  createIncomeController
);
incomesRoutes.get("", authUserMiddleware, getSelfIncomesController);
incomesRoutes.get("/self-profits", authUserMiddleware, getSelfProfitsController);
incomesRoutes.get(
  "/self-profits/:fund_alias",
  authUserMiddleware,
  fundExistsMiddleware,
  getSelfProfitsByFundController
);
incomesRoutes.get("/patrimony", authUserMiddleware, getSelfPatrimonyByTypeController);
incomesRoutes.get(
  "/:fund_alias",
  authUserMiddleware,
  fundExistsMiddleware,
  getSelfIncomesController
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
