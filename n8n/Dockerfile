ARG BUILD_FROM=docker.n8n.io/n8nio/n8n:latest
FROM ${BUILD_FROM}

# Switch to root to set permissions
USER root

# Create the data directory and set proper ownership
RUN mkdir -p /data/.n8n && chown -R node:node /data

# Set n8n to use /data for persistence
ENV N8N_USER_FOLDER=/data

# Switch back to node user
USER node