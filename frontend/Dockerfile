FROM node:20 AS builder

WORKDIR /app

ARG VITE_API_URL

COPY package*.json ./
RUN npm install

ENV VITE_API_URL=$VITE_API_URL

COPY . .

RUN npm run build

FROM node:20-slim

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]

