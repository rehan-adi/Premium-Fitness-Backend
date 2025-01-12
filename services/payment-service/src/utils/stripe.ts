import env from "dotenv";
import Stripe from "stripe";

env.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia"
});

export async function processPayment(
  orderId: string,
  userId: string,
  amount: number,
  item: string
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: { orderId, userId, item },
    });

    console.log(paymentIntent);
    return { success: true, paymentIntentId: paymentIntent.id };
  } catch (error: any) {
    console.error(`Payment failed for order ${orderId}:`, error.message);
    return { success: false, error: error.message };
  }
}
