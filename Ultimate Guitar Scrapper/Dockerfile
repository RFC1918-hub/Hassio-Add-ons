# Stage 1: Build Go binary
FROM golang:1.20-alpine AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go mod tidy && go build -o ultimate-guitar-scraper

# Stage 2: Build React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 3: Final image
FROM node:18-alpine
WORKDIR /app

# Install Node.js dependencies for the backend
COPY package.json ./
RUN npm install --production

# Copy Go binary and make it executable
COPY --from=go-builder /app/ultimate-guitar-scraper .
RUN chmod +x ultimate-guitar-scraper

# Copy server files
COPY n8n-wrapper.js .

# Optional: Copy .env file (or pass environment variables at runtime)
# COPY .env .

# Copy the built frontend
COPY --from=frontend-builder /app/frontend/build ./public

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV N8N_WEBHOOK_URL=""
ENV ALLOWED_ORIGINS=""

# Start the Node.js wrapper
CMD ["node", "n8n-wrapper.js"]
