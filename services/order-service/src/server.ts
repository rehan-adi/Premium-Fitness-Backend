import cors from "cors";
import env from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";

env.config();

const server = express();

// middleware's
server.use(express.json());
server.use(cookieParser());
server.use(
  cors({
    origin: "http://localhost:3000",
  })
);
server.use(morgan("dev"));

// Health Check Route
server.get("/", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Order service is running" });
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
  console.log(`Order service is running on port ${process.env.PORT}`);
});
