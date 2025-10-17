ARG BUILD_FROM=ghcr.io/fallenbagel/jellyseerr:latest
FROM ${BUILD_FROM}

USER root

# Set Jellyseerr to use /data for configuration
ENV CONFIG_DIR=/data

# Create entrypoint that ensures /data exists and links to /app/config
ENTRYPOINT ["/bin/sh", "-c", "mkdir -p /data && rm -rf /app/config && ln -sf /data /app/config && node dist/index.js"]
