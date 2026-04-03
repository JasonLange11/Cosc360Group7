import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./data/db/connection.js"
import usersRouter from "./modules/users/users.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import eventsRouter from "./modules/events/events.routes.js";
import groupsRouter from "./modules/groups/groups.routes.js"
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter)
app.use("/api/events", eventsRouter)
app.use("/api/groups", groupsRouter)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(errorHandler);


async function startServer(){
 
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server: ", error);
  process.exit(1);
});
