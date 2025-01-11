import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { publishEvent } from "../utils/kafka";
import { OrderSchema } from "../validations/order.validation";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: No user ID found" });
      return;
    }

    const parsedBody = OrderSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        message: parsedBody.error.errors.map((err) => err.message).join(", "),
      });
      return;
    }

    const { item, amount } = parsedBody.data;

    const saveOrder = await prisma.order.create({
      data: {
        userId,
        amount,
        item,
        status: "pending",
      },
    });

    const orderPayload = {
      orderId: saveOrder.orderId,
      userId: saveOrder.userId,
      amount: saveOrder.amount,
      item: saveOrder.item,
    };

    await publishEvent(JSON.stringify(orderPayload));

    res
      .status(201)
      .json({ success: true, message: "Order created successfully" });
  } catch (error) {
    console.error("error while creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
