ARG BUILD_FROM
FROM $BUILD_FROM

# Install requirements for add-on
RUN apk add --no-cache \
    bash \
    curl

# Copy run script
COPY run.sh /
RUN chmod a+x /run.sh

# Use Pi-hole's base image components
FROM pihole/pihole:latest

# Copy our run script
COPY --from=0 /run.sh /run.sh

# Labels
LABEL \
    io.hass.name="Pi-hole" \
    io.hass.description="Network-wide ad blocking" \
    io.hass.arch="armhf|aarch64|i386|amd64|armv7" \
    io.hass.type="addon" \
    io.hass.version="1.0.0"

CMD ["/run.sh"]