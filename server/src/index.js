import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./data/db/connection.js"
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import usersRouter from "./modules/users/users.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import eventsRouter from "./modules/events/events.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
const PORT = process.env.PORT || 3001;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cosc 360 API",
      version: "1.0.0",
      description: "Backend API documentation"
    }
  },
  apis: ["./src/modules/users/*.js", "./src/modules/auth/*.js", "./src/modules/events/*.js", "./src/index.js"]
};

const specs = swaggerJSDoc(swaggerOptions);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter)
app.use("/api/events", eventsRouter)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(errorHandler);


async function startServer(){
 
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Server docs running on http://localhost:${PORT}/docs`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server: ", error);
  process.exit(1);
});
