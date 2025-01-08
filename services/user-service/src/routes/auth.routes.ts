import express from "express";

export const authRoute = express.Router();

authRoute.post("/signup");
authRoute.post("/signin");