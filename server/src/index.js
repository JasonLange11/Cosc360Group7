import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import usersRouter from "./modules/users/users.routes.js";

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
  apis: ["./src/modules/users/*.js", "./src/index.js"]
};

const specs = swaggerJSDoc(swaggerOptions);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/users", usersRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));


async function startServer(){
  if(!process.env.MONGODB_URI){
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Server docs running on http://localhost:${PORT}/docs`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server: ", error);
  process.exit(1);
});
