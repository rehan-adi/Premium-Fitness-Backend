export const config = {
  port: process.env.PORT || 3000,
  userServiceUrl: process.env.USER_SERVICE_URL || "http://user-service:1000",
  orderServiceUrl: process.env.ORDER_SERVICE_URL || "http://order-service:2000",
};
