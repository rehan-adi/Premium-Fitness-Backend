import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { paymentSchema } from "../validations/payment.validations";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const addPaymentMethods = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { card_number, expiry_date, cardholder_name } = paymentSchema.parse(
      req.body
    );
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: No user ID found" });
      return;
    }

    const isCardNumberExists = await prisma.payment_methods.findFirst({
      where: {
        card_number: card_number,
        userId,
      },
    });

    if (isCardNumberExists) {
      res.status(409).json({ success: false, message: "Card already exists" });
      return;
    }

    // Convert expiry_date from MM/YY format to a full date
    const [month, year] = expiry_date.split("/");
    const expiryDate = new Date(`20${year}-${month}-01`);

    await prisma.payment_methods.create({
      data: {
        userId: userId,
        card_number,
        cardholder_name,
        expiry_date: expiryDate,
      },
    });

    res.status(201).json({
      success: true,
      message: "Payment method added successfully",
    });
  } catch (error: any) {
    console.error("Error adding payment method:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add payment method",
      error: error.message,
    });
  }
};

export const getPaymentDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;

  try {
    const userPaymentDetails = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        paymentMethods: {
          select: {
            id: true,
            card_number: true,
            cardholder_name: true,
            expiry_date: true,
          },
        },
      },
    });

    if (!userPaymentDetails) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (
      !userPaymentDetails.paymentMethods ||
      userPaymentDetails.paymentMethods.length === 0
    ) {
      res.status(404).json({
        success: false,
        message: "No payment details found for this user",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: userPaymentDetails.paymentMethods[0],
      email: userPaymentDetails.email,
      message: "Payment details fetched successfully",
    });
  } catch (error: any) {
    console.error("Error fetching payment method or user details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    });
  }
};
