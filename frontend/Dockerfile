# Build
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Serve
FROM node:22-alpine
WORKDIR /app

RUN npm install -g serve@14

COPY --from=build /app/dist ./dist

ENV PORT=4173
EXPOSE 4173

CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT}"]
