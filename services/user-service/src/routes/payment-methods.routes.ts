import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { addPaymentMethods } from "../controllers/payment-methods";

export const paymentRoute: Router = Router();

paymentRoute.post("/add", authMiddleware, addPaymentMethods);
