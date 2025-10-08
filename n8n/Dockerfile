ARG BUILD_FROM=ghcr.io/hassio-addons/base:16.3.2
FROM ${BUILD_FROM}

# Install Node.js and dependencies
RUN apk add --no-cache \
    nodejs \
    npm \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# Install n8n globally
RUN npm install -g n8n

# Create node user if it doesn't exist
RUN addgroup -g 1000 node && \
    adduser -D -u 1000 -G node node

# Copy service script
COPY rootfs /

# Make the run script executable
RUN chmod a+x /etc/services.d/n8n/run

# Set working directory
WORKDIR /data