# syntax=docker/dockerfile:1
FROM node:16-alpine
ENV NODE_ENV=production
RUN apk add --no-cache ffmpeg
RUN apk add --no-cache caddy
EXPOSE 3001

WORKDIR /app
COPY . .

WORKDIR /app/server
RUN npm ci
WORKDIR /app/client
RUN npm ci

WORKDIR /app/server/books
ADD https://github.com/pfeiferj/audiobook-server/releases/download/v0.1.0/daniel_boone.m4a .

WORKDIR /app
RUN npm ci
RUN npm run build
CMD ["npm", "start"]
