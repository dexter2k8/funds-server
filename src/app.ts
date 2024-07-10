import express from "express";
import errorHandler from "./errors/errorHandler";
import userRoutes from "./routes/users.routes";
import "dotenv/config";

const app = express();
app.use(express.json());

app.use("/users", userRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Funds Explorer Server!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
