import { Kafka, Partitioners } from "kafkajs";
import { sendToDLQ } from "./dlq";
import { resend } from "./resend";

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: ["kafka:9092"],
  retry: {
    initialRetryTime: 100,
    maxRetryTime: 30000,
    retries: 5,
    factor: 0.2,
  },
});

export const producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner
});

const consumer = kafka.consumer({
  groupId: "notification-service-group",
});

export async function runConsumer() {
  try {
    await producer.connect();
    await consumer.connect();

    await consumer.subscribe({ topic: "payment.event", fromBeginning: true });

    console.log("Consumer and Producer is running");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value?.toString() || "{}");

        if (topic === "payment.event") {
          const userEmail = event.email;
          const paymentId = event.paymentIntentId;
          const paymentStatus = event.paymentStatus;

          try {
            if (paymentStatus === "success") {
              const { data, error } = await resend.emails.send({
                from: "Acme <onboarding@resend.dev>",
                to: userEmail,
                subject: "Payment Successful - Thank You!",
                html: `
                  <html>
                    <body>
                      <div style="font-family: Arial, sans-serif; color: #333;">
                        <h1 style="color: #28a745;">Payment Successful!</h1>
                        <p>Dear Customer,</p>
                        <p>We are excited to inform you that your payment of <strong>$${event.amount}</strong> was successfully processed.</p>
                        <p><strong>Order Details:</strong></p>
                        <ul>
                          <li><strong>Order ID:</strong> #${event.orderId}</li>
                          <li><strong>Item:</strong> ${event.item}</li>
                        </ul>
                        <p>Your payment has been processed successfully with the Transaction ID: <strong>${paymentId}</strong>.</p>
                        <p>If you have any questions or need further assistance, feel free to reach out to us.</p>
                        <p>Thank you</p>
                      </div>
                    </body>
                  </html>
                `,
              });

              if (error) {
                console.error(
                  `Error sending success email to ${userEmail}:`,
                  error
                );
              } else {
                console.log(
                  `Success email sent to ${userEmail} regarding payment.`
                );
              }
            } else if (paymentStatus === "failed") {
              const { data, error } = await resend.emails.send({
                from: "Acme <onboarding@resend.dev>",
                to: userEmail,
                subject: "Payment Failed - Action Required",
                html: `
                  <html>
                    <body>
                      <div style="font-family: Arial, sans-serif; color: #333;">
                        <h1 style="color: #dc3545;">Payment Failed</h1>
                        <p>Dear Customer,</p>
                        <p>We regret to inform you that your payment of <strong>$${event.amount}</strong> could not be processed.</p>
                        <p><strong>Order Details:</strong></p>
                        <ul>
                          <li><strong>Order ID:</strong> #${event.orderId}</li>
                          <li><strong>Item:</strong> ${event.item}</li>
                        </ul>
                        <p>Transaction ID: <strong>${paymentId}</strong></p>
                        <p>Please check your payment method or contact our support team if you need assistance in resolving this issue.</p>
                        <p>We apologize for the inconvenience and appreciate your understanding.</p>
                      </div>
                    </body>
                  </html>
                `,
              });

              if (error) {
                console.error(
                  `Error sending failure email to ${userEmail}:`,
                  error
                );
              } else {
                console.log(
                  `Failure email sent to ${userEmail} regarding payment.`
                );
              }
            }
          } catch (error: any) {
            console.error(
              `Error sending email to ${userEmail}:`,
              error.message
            );
            sendToDLQ(event, error.message);
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
