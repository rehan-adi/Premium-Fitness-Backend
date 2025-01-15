FROM node:20-alpine

WORKDIR /app/notification-service

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 5000

CMD [ "node", "dist/server.js" ]