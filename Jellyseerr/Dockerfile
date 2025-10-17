ARG BUILD_FROM=ghcr.io/fallenbagel/jellyseerr:latest
FROM ${BUILD_FROM}

USER root

# Set Jellyseerr to use /data for configuration
ENV CONFIG_DIR=/data

# Create entrypoint that ensures /data exists and maps it to /app/config
RUN mkdir -p /data && \
    ln -sf /data /app/config

# Switch back to node user
USER node

WORKDIR /app

CMD ["node", "dist/index.js"]
