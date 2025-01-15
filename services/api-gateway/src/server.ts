import cors from "cors";
import env from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import bodyParser from "body-parser";
import compression from "compression";
import proxy from "express-http-proxy";
import { config } from "./config/index";
import express, { Request, Response } from "express";
import { authLimiter, orderLimiter } from "./utils/limiters";

env.config();

const server = express();
const PORT = config.port;

// middleware's
server.use(cors());
server.use(helmet());
server.use(morgan("dev"));
server.use(compression());
server.use(bodyParser.json());

// proxy middleware for User Service (handles both /auth and /payment-methods)
const userServiceProxy = proxy(config.userServiceUrl, {
  proxyReqPathResolver: (req) => {
    const newPath = req.originalUrl.replace(/^\/api/, "");
    return newPath;
  },
});

// proxy middleware for Order Service
const orderServiceProxy = proxy(config.orderServiceUrl, {
  proxyReqPathResolver: (req) => {
    const newPath = req.originalUrl.replace(/^\/api/, "");
    return newPath;
  },
});

// user service routes
server.use("/api/auth", authLimiter, userServiceProxy);
server.use("/api/payment-methods", userServiceProxy);

// order service routes
server.use("/api/order", orderLimiter, orderServiceProxy);

// health check route
server.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "API Gateway is running" });
});

// fallback route for unmatched requests
server.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
