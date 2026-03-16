# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the Vite frontend into dist/public
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install only production deps needed at runtime
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend and server source
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# If you use dotenv in server/index.ts, do NOT copy .env into the image.
# Pass secrets at runtime from Huawei Cloud instead.

EXPOSE 5000

# Run the TypeScript server directly with tsx
CMD ["node", "--import", "tsx", "server/index.ts"]