# Build stage
FROM golang:1.20-alpine AS builder

WORKDIR /app
COPY . .

# Build the Go application
RUN go build -o ultimate-guitar-scraper

# Final stage
FROM node:18-alpine

WORKDIR /app

# Install Node.js dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy the built Go binary and the Node.js wrapper
COPY --from=builder /app/ultimate-guitar-scraper .
COPY n8n-wrapper.js .

# Make sure the Go binary is executable
RUN chmod +x ultimate-guitar-scraper

# Expose the port the app runs on
EXPOSE 3000

# Start the Node.js wrapper
CMD ["node", "n8n-wrapper.js"]
