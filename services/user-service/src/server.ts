import hpp from "hpp";
import env from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import express, { Response } from "express";
import { authRoute } from "./routes/auth.routes";

env.config();

const server = express();

// middleware's
server.use(express.json());
server.use(helmet());
server.use(hpp());
server.use(morgan("dev"));

// Disabling 'X-Powered-By' header for security reasons
server.disable("x-powered-by");

// routes
server.use("/auth", authRoute);
// server.use("/payment-methods");

// Health Check Route
server.get("/", (res: Response) => {
  res.status(200).json({ success: true, message: "User service is running" });
});

server.listen(process.env.PORT, () => {
  console.log(`User service is running at port ${process.env.PORT}...`);
});
