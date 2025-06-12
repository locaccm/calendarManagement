# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with exact versions for reproducibility
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install curl and git for healthcheck and potential operations
RUN apk --no-cache add curl git

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy prisma schema and generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Set environment variables with defaults
# These can be overridden at runtime
ENV NODE_ENV="production"
ENV PORT="3000"
ENV CORS_ORIGIN="*"
ENV ACCESS_API_URL="http://localhost:4000/access/check"
ENV API_VERSION="1.0.0"
ENV API_TITLE="Calendar Management API"

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Command to run the application using npm start
CMD ["npm", "start"]
