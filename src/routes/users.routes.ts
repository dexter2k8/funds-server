import { Router } from "express";
import { createUserController } from "../controllers/users.controllers";
import { userExistsMiddleware } from "../middlewares/users.middlewares";

const userRoutes = Router();

userRoutes.post("", userExistsMiddleware, createUserController);

export default userRoutes;
