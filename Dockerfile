# Use the official Node.js 20 Alpine image as a base
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Set environment variables
# These can be overridden at build time using --build-arg
ARG DATABASE_URL
ARG ACCESS_API_URL
ENV DATABASE_URL=${DATABASE_URL}
ENV ACCESS_API_URL=${ACCESS_API_URL}
ENV PORT=3000

# Copy package files
COPY package*.json ./

# Install all dependencies (critical step!)
RUN npm ci


# Copy the rest of the application source code into the container
COPY . .

# Generate the Prisma client
RUN npm run generate

# Build the TypeScript project
RUN npm run build

# Set NODE_ENV to production for the runtime environment
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]