import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { Request, Response } from "express";

// Define Zod schema for input validation
const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  email: z.string().email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  card_number: z.string().length(16, "Card number must be exactly 16 digits."),
  expiry_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid expiry date.",
  }),
});

export const signup = async (req: Request, res: Response) => {
  try {
    // Parse and validate the input using Zod
    const parsedBody = signupSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: parsedBody.error.errors.map((err) => err.message).join(", "),
      });
    }

    const { name, email, password, card_number, expiry_date } = parsedBody.data;

    // Check if the email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start a transaction to create user and payment method
    const user = await prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      await prisma.payment_methods.create({
        data: {
          userId: newUser.id,
          card_number: card_number,
          expiry_date: new Date(expiry_date),
        },
      });

      return newUser;
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to signup.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const signin = async () => {
    try {
    } catch (error) {}
  };
  