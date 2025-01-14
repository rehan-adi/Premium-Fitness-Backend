import { producer } from "./kafka";

export async function sendToDLQ(event: string, error: string) {
  try {
    await producer.send({
      topic: "payment.event-dlq",
      messages: [
        {
          value: JSON.stringify({
            event,
            error,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log("Failed message sent to DLQ:", event);
  } catch (err) {
    console.error("Error sending message to DLQ:", err);
  }
}
