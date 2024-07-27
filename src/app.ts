import express from "express";
import errorHandler from "./errors/errorHandler";
import userRoutes from "./routes/users.routes";
import loginRoutes from "./routes/login.routes";
import fundRoutes from "./routes/funds.routes";
import incomesRoutes from "./routes/incomes.routes";
import transactionsRoutes from "./routes/transactions.routes";
import "dotenv/config";
import { authUserMiddleware } from "./middlewares/authUserMiddleware";

const app = express();
app.use(express.json());

app.use("/login", loginRoutes);
app.use("/users", userRoutes);
app.use("/funds", fundRoutes);
app.use("/incomes", incomesRoutes);
app.use("/transactions", transactionsRoutes);

app.use(errorHandler);

app.get("/verify-token", authUserMiddleware, (_, res) => {
  res.json({ isValid: true });
});

app.get("/", (_, res) => {
  res.json({ message: "Welcome to Funds Explorer Server!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.info(`Server running on port ${PORT}`));

export default app;
