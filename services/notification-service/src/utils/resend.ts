import env from "dotenv";
import { Resend } from "resend";

env.config();

export const resend = new Resend(process.env.RESEND_API_KEY);
