import { Router } from "express";
import { signin, signup } from "../controllers/auth";

export const authRoute: Router = Router();

authRoute.post("/signup", signup as any);
authRoute.post("/signup", signin as any);
