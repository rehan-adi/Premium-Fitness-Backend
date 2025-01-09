import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

const signinSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedBody = signupSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        message: parsedBody.error.errors.map((err) => err.message).join(", "),
      });
      return; // Ensure no further execution
    }

    const { name, email, password, card_number, expiry_date } = parsedBody.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res
        .status(409)
        .json({ success: false, message: "Email is already in use." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });

      await prisma.payment_methods.create({
        data: {
          userId: newUser.id,
          card_number,
          expiry_date: new Date(expiry_date),
        },
      });

      return newUser;
    });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to signup.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedBody = signinSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        message: parsedBody.error.errors.map((err) => err.message).join(", "),
      });
      return;
    }

    const { email, password } = parsedBody.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "User signed in successfully.",
      data: { userId: user.id, email: user.email, token },
    });
  } catch (error: any) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sign in.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
