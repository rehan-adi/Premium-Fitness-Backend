import cors from "cors";
import env from "dotenv";
import morgan from "morgan";
import { runConsumer } from "./utils/kafka";
import express, { NextFunction, Request, Response } from "express";

env.config();

const server = express();

runConsumer();

// middleware's
server.use(express.json());
server.use(
  cors({
    origin: "http://localhost:3000",
  })
);
server.use(morgan("dev"));

// Health Check Route
server.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ success: true, message: "Payment service is running" });
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
  console.log(`Payment service is running on port ${process.env.PORT}`);
});