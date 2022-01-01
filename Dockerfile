# syntax=docker/dockerfile:1
FROM node:16-alpine
ENV NODE_ENV=production
RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY . .

WORKDIR /app/server
RUN npm ci
WORKDIR /app/client
RUN npm ci

WORKDIR /app
RUN npm run build
CMD ["npm", "start"]
