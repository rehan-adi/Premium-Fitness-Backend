import { Kafka } from "kafkajs";
import { resend } from "./resend";

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: ["localhost:29092"],
  retry: {
    initialRetryTime: 100,
    maxRetryTime: 30000,
    retries: 10,
    factor: 0.2,
  },
});

const consumer = kafka.consumer({
  groupId: "notification-service-group",
});

export async function runConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "payment.event", fromBeginning: true });

    console.log("Consumer is listening to payment.event");

    // Process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value?.toString() || "{}");

        if (topic === "payment.event") {
          console.log(
            `Received payment.success event: ${JSON.stringify(event)}`
          );

          const userEmail = event.email;
          const paymentId = event.paymentIntentId;

          try {
            await resend.emails.send({
              from: "no-reply@yourdomain.com",
              to: userEmail,
              subject: "Payment Success",
              html: `
                <h1>Payment Successful</h1>
                <p>Your payment of $${event.amount} was successful.</p>
                <p>For the order $${event.item} order if is ${event.orderId}</p>
                <p>Transaction ID: ${paymentId}</p>
              `,
            });

            console.log(
              `Email sent to ${userEmail} regarding payment success.`
            );
          } catch (error) {
            console.error(`Error sending email to ${userEmail}:`, error);
          }
        }
      },
    });
  } catch (error) {
    console.error("Error in Kafka consumer:", error);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await consumer.disconnect();
  console.log("Kafka producer disconnected");
  process.exit();
});
