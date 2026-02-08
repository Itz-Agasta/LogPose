# Single-stage Dockerfile for LogPose server
FROM oven/bun:1

WORKDIR /app

# Copy root package files
COPY package.json bun.lock turbo.json ./

# Copy packages
COPY packages ./packages

# Copy server app
COPY apps/server ./apps/server

# Install dependencies
RUN bun install

# Build the monorepo
RUN bun run build

# Set working directory to server
WORKDIR /app/apps/server

# Expose the port
EXPOSE 3000

# Run the server
CMD ["bun", "dist/index.mjs"]
