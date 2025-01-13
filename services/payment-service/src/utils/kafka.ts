import axios from "axios";
import { Kafka } from "kafkajs";
import { processPayment } from "../utils/stripe";

const kafka = new Kafka({
  clientId: "payment-service",
  brokers: ["localhost:29092"],
  retry: {
    initialRetryTime: 100,
    maxRetryTime: 30000,
    retries: 10,
    factor: 0.2,
  },
});

const producer = kafka.producer();
let isProducerConnected = false;

export async function publishEvent(
  orderId: string,
  userId: string,
  email: string,
  amount: number,
  item: string,
  paymentStatus: string,
  paymentIntentId: string
) {
  if (!isProducerConnected) {
    await producer.connect();
    isProducerConnected = true;
  }

  const messageData = {
    orderId,
    userId,
    email,
    amount,
    item,
    paymentStatus,
    paymentIntentId,
  };

  await producer.send({
    topic: "payment.event",
    messages: [
      { key: `message-${Date.now()}`, value: JSON.stringify(messageData) },
    ],
  });
}

const consumer = kafka.consumer({
  groupId: "payment-service-group",
});

export async function runConsumer() {
  try {
    await consumer.connect();

    await consumer.subscribe({ topic: "order.create", fromBeginning: true });
    console.log("Consumer is listening to order.create");

    // Process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const orderData = JSON.parse(message.value?.toString() || "{}");
        const { orderId, userId, amount, item } = orderData;

        if (!orderId || !userId || !amount) {
          console.error("Invalid order data:", orderData);
          return;
        }

        const getUserPaymentDetails = await axios.get(
          `http://localhost:3000/api/payment-methods/get/${userId}`
        );
        const userEmail = getUserPaymentDetails.data.email;

        const result = await processPayment(orderId, userId, amount, item);
        console.log(`Payment result for order ${orderId}:`, result);

        if (result.success) {
          const paymentIntentId = result.paymentIntentId!;
          const paymentStatus = "success";

          publishEvent(
            orderId,
            userId,
            userEmail,
            amount,
            item,
            paymentStatus,
            paymentIntentId
          );
        } else {
          const paymentIntentId = result.paymentIntentId || "N/A";
          const paymentStatus = "failed";
          publishEvent(
            orderId,
            userId,
            userEmail,
            amount,
            item,
            paymentStatus,
            paymentIntentId
          );
        }
      },
    });
  } catch (error) {
    console.error("Error in Kafka consumer:", error);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await producer.disconnect();
  await consumer.disconnect();
  console.log("Kafka producer disconnected");
  process.exit();
});
