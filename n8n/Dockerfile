ARG BUILD_FROM=docker.n8n.io/n8nio/n8n:latest
FROM ${BUILD_FROM}

USER root

# Set n8n to use /data
ENV N8N_USER_FOLDER=/data

# Create a simple entrypoint that fixes permissions then runs n8n
ENTRYPOINT ["/bin/sh", "-c", "mkdir -p /data && chown -R node:node /data && su-exec node n8n start"]