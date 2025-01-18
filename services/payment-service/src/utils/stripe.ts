import env from "dotenv";
import Stripe from "stripe";

env.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export async function processPayment(
  orderId: string,
  userId: string,
  amount: number,
  item: string,
  cardNumber: string,
  expiry_date: string
) {
  try {
    const [expMonth, expYear] = expiry_date
      .split("/")
      .map((part) => parseInt(part, 10));

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      payment_method: paymentMethod.id,
      metadata: {
        orderId,
        userId,
        item,
      },
      confirm: true,
    });

    console.log(paymentIntent);
    return { success: true, paymentIntentId: paymentIntent.id };
  } catch (error: any) {
    console.error(`Payment failed for order ${orderId}:`, error.message);
    return { success: false, error: error.message };
  }
}
