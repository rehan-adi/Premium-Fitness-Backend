FROM node:20-alpine

WORKDIR /app/payment-service

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 4000

CMD [ "node", "dist/server.js" ]