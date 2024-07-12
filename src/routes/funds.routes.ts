import { Router } from "express";
import { createFundController } from "../controllers/funds.controllers";

const fundRoutes = Router();

fundRoutes.post("", createFundController);

export default fundRoutes;
