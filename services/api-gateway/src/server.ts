import express, { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const server = express();
const PORT = process.env.PORT || 3000;

// Proxy requests to user-service and order-service
server.use(
  "/api/v1/user",
  createProxyMiddleware({
    target: "http://user-service:4000",
    changeOrigin: true,
  })
);
server.use(
  "/api/v1/order",
  createProxyMiddleware({
    target: "http://order-service:5000",
    changeOrigin: true,
  })
);

// health check route
server.get("/", (req: Request, res: Response) => {
  res.send("API Gateway is running");
});

server.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
