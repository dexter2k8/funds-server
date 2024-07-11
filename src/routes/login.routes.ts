import { Router } from "express";
import { loginController } from "../controllers/login.controllers";
import { dataValidateMiddleware } from "../middlewares/dataValidate.middleware";
import { loginSchema } from "../serializers/login.schemas";

const loginRoutes = Router();

loginRoutes.post("", dataValidateMiddleware(loginSchema), loginController);

export default loginRoutes;
