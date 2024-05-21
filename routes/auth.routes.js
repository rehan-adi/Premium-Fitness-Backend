import express from "express";
import { register, login } from "../controllers/auth.controllers.js";

const authRouter = express.Router();

authRouter.post("/reginter", register);
authRouter.post("/login", login);

export default authRouter;
