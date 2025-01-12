import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { addPaymentMethods, getPaymentDetails } from "../controllers/payment-methods";

export const paymentRoute: Router = Router();

paymentRoute.post("/add", authMiddleware, addPaymentMethods);
paymentRoute.get("/get/:userId", getPaymentDetails);
