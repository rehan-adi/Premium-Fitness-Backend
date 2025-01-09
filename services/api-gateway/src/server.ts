import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const server = express();
const PORT = process.env.PORT || 3000;

// middleware's
server.use(cors());
server.use(morgan("dev"));
server.use(bodyParser.json());

// proxy middleware for User Service (handles both /auth and /payment-methods)
const userServiceProxy = createProxyMiddleware({
  target: "http://localhost:1000",
  changeOrigin: true,
  timeout: 7000,
  pathRewrite: {
    "^/auth": "/auth",
    "^/payment-methods": "/payment-methods",
  },
});

// user service routes
server.use("/auth", userServiceProxy); // Forward /auth to User Service
server.use("/payment-methods", userServiceProxy); // Forward /payment-methods to User Service

// health check route
server.get("/", (req: Request, res: Response) => {
  res.send("API Gateway is running");
});

// fallback route for unmatched requests
server.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
