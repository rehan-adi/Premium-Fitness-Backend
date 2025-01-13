import env from "dotenv";
import morgan from "morgan";
import { runConsumer } from "./utils/kafka";
import express, { NextFunction, Request, Response } from "express";

env.config();

const server = express();

// run kafka consumer
runConsumer();

// middleware's
server.use(express.json());
server.use(morgan("dev"));

// Health Check Route
server.get("/", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ success: true, message: "Notification service is running" });
});

// Error handling middleware
server.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Notification service is running on port ${process.env.PORT}`);
});
