### payment-processing-microservices Architecture

## Overview

This readme file provides a detailed explanation of the architecture for a microservices-based application. The system comprises five services: Gateway Service, User Service, Order Service, Payment Service, and Notification Service. Each service communicates via REST APIs, Kafka topics, and follows an event-driven architecture for scalability and reliability.

![Architecture Diagram](./assets/architecture.png)

## Service Descriptions

### 1. Gateway Service

The Gateway Service acts as a reverse proxy, routing requests to the appropriate microservices.

**Responsibilities**:

- Handles incoming HTTP requests.

- Routes requests to User Service or Order Service based on the endpoint.

### 2. User Service

The User Service manages user-related operations and stores user data.

**Responsibilities**:

- Handles user sign-up and sign-in.

- Stores and manages user payment details.

- Exposes an endpoint to retrieve user payment details for the Payment Service.

**Database**:

- Stores user information and payment details.

**API Endpoints**:

- `POST /signup`: Sign up a new user.
- `POST /signin`: Sign in a user.
- `POST /add`: Add payment details.
- `GET /get/:userId`: Retrieve user payment details.

### 3. Order Service

The Order Service handles order creation and status management.

**Responsibilities**:

- Creates new orders with a status of "pending".

- Publishes an event to the order.create Kafka topic.

- Listens to the payment.event topic to update order statuses based on payment results.

**Database**:

Stores order information and status.

**API Endpoints**:

- `POST /create`: Create a new order.
- `GET /status/:orderId`: Get order status.

### 4. Payment Service

The Payment Service manages payment processing.

**Responsibilities**:

- Subscribes to the order.create Kafka topic to process new orders.

- Sends a GET request to the User Service to retrieve payment details.

- Processes payments using Stripe.

- Publishes an event to the payment.event Kafka topic with payment details.

**Integration**:

Communicates with Stripe for payment processing.

### 5. Notification Service

The Notification Service handles user notifications.

**Responsibilities**:

- Subscribes to the payment.event Kafka topic to receive payment status updates.

- Sends email notifications to users based on payment status.

- Implements a Dead Letter Queue (DLQ) for failed notifications.

### Message Broker (Kafka)

Kafka is used for event-driven communication between services.

**Topics**:

- order.create: Published by Order Service; consumed by Payment Service.

- payment.event: Published by Payment Service; consumed by Order and Notification Services.

**DLQ**:

Maintains failed messages in Notification Service debugging purposes.

## Technologies Used

- Backend Frameworks: Node.js, Express

- Message Broker: Apache Kafka

- Database: PostgreSQL

- Payment Integration: Stripe

- Containerization: Docker

## Conclusion

This architecture is designed for scalability, maintainability, and fault tolerance. Each service is independently deployable and can be scaled as needed to handle increased load.
