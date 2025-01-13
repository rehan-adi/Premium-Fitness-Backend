import { Kafka } from "kafkajs";

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

    await consumer.subscribe({ topic: "payment.success", fromBeginning: true });
    await consumer.subscribe({ topic: "payment.failed", fromBeginning: true });

    console.log("Consumer is listening to payment.success and payment.failed");

    // Process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(
          `Received message from ${topic}: ${message.value?.toString()}`
        );
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
