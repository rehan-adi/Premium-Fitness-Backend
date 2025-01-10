import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { signupSchema, signinSchema } from "../validations/auth.validations";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedBody = signupSchema.safeParse(req.body);

    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        message: parsedBody.error.errors.map((err) => err.message).join(", "),
      });
      return;
    }

    const { name, email, password, phone_number } = parsedBody.data;

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
        data: { name, email, password: hashedPassword, phone_number },
      });

      return newUser;
    });

    res.status(201).json({
      success: true,
      data: { id: user.id, email: user.email },
      message: "User created successfully.",
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

    res.cookie("token", token, {
      maxAge: 72 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      data: { userId: user.id, email: user.email, token },
      message: "User signed in successfully.",
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
