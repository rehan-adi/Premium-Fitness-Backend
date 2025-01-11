import { Router } from "express";
import { createOrder } from "../controllers/order";
import { authMiddleware } from "../middleware/authMiddleware";

export const orderRoute: Router = Router();

orderRoute.post("/create", authMiddleware, createOrder);
// orderRoute.get("/status/:orderId");
