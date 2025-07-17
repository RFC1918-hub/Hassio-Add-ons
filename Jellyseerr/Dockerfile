ARG BUILD_FROM=ghcr.io/fallenbagel/jellyseerr:latest
FROM ${BUILD_FROM}

# Create a symlink so that /app/config points to the persistent addon_config directory
RUN rm -rf /app/config && \
    ln -s /data/addon_config /app/config

# Ensure the addon_config directory exists and has proper permissions
RUN mkdir -p /data/addon_config && \
    chown -R node:node /data/addon_config

# Alternative: Set environment variable to change config location
# ENV CONFIG_DIRECTORY=/data/addon_config