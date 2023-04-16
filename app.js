import dotenv from "dotenv";
dotenv.config();
import "express-async-errors";

import express from "express";
const app = express();
const port = process.env.PORT || 3000;

// swagger
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
const swaggerDocument = YAML.load("./swagger.yaml");

// security
import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";

// connectDB & authentication
import connectDB from "./db/connect.js";
import auth from "./middleware/authentication.js";

// router
import authRouter from "./routes/auth.js";
import jobsRouter from "./routes/jobs.js";

// middleware
import notFound from "./middleware/not-found.js";
import errorHandler from "./middleware/error-handler.js";

app.set("trust proxy", 1);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

app.get("/", (req, res) => {
  res.send(`
    <h1>Jobs API</h1>
    <a href="/api-docs">Documentation</a>
  `);
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", auth, jobsRouter);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server Listening on Port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
