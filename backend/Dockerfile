# Use Node.js 20 Alpine for compatibility with Azure SDK
FROM node:20-alpine

# Install OpenSSL 1.1 for Prisma compatibility
RUN apk add --no-cache \
    openssl1.1-compat \
    python3 \
    make \
    g++ \
    sqlite-dev \
    postgresql-dev \
    mysql-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy source code
COPY . ./

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN yarn build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["yarn", "start"]
