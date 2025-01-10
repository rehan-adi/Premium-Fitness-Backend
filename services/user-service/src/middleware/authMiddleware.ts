import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is not defined");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    ) as jwt.JwtPayload;

    if (!decoded.userId) {
      throw new Error("Token payload is missing UserId");
    }

    req.user = { id: decoded.userId };

    next();
  } catch (error: any) {
    console.error("JWT verification error:", error);
    res
      .status(401)
      .json({ message: "Unauthorized: Invalid token", error: error.message });
  }
};
