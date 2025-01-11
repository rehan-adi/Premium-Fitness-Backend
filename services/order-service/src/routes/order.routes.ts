import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createOrder, getOrderStatus } from "../controllers/order";

export const orderRoute: Router = Router();

orderRoute.post("/create", authMiddleware, createOrder);
orderRoute.get("/status/:orderId", authMiddleware, getOrderStatus);
