import hpp from "hpp";
import cors from "cors";
import env from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { authRoute } from "./routes/auth.routes";
import { paymentRoute } from "./routes/payment-methods.routes";
import express, { NextFunction, Request, Response } from "express";

env.config();

const server = express();

// middleware's
server.use(express.json());
server.use(cookieParser());
server.use(hpp());
server.use(
  cors({
    origin: "http://localhost:3000",
  })
);
server.use(helmet());
server.use(morgan("dev"));

// Disabling 'X-Powered-By' header for security reasons
server.disable("x-powered-by");

// routes
server.use("/auth", authRoute);
server.use("/payment-methods", paymentRoute);

// Health Check Route
server.get("/", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "User service is running" });
});

// Error handling middleware
server.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 404 handler
server.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

server.listen(process.env.PORT, () => {
  console.log(`User service is running at port ${process.env.PORT}...`);
});
