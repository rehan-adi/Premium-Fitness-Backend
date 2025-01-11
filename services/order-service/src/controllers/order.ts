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

export const getOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated." });
      return;
    }

    const orderId = req.params.orderId;

    if (!orderId) {
      res
        .status(400)
        .json({ success: false, message: "Order ID is required." });
      return;
    }

    const orderStatus = await prisma.order.findUnique({
      where: {
        orderId,
        userId,
      },
    });

    if (!orderStatus) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: orderStatus.orderId,
        status: orderStatus.status,
      },
      message: "Order status retrieved successfully.",
    });
  } catch (error) {
    console.error("Error while checking order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check order status.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
