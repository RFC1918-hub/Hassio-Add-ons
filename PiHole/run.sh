#!/usr/bin/with-contenv bashio

# Get configuration
WEBPASSWORD=$(bashio::config 'WEBPASSWORD')
TZ=$(bashio::config 'TZ')
DNSMASQ_LISTENING=$(bashio::config 'DNSMASQ_LISTENING')
PIHOLE_DNS=$(bashio::config 'PIHOLE_DNS_')
VIRTUAL_HOST=$(bashio::config 'VIRTUAL_HOST')

# Export environment variables
export WEBPASSWORD="$WEBPASSWORD"
export TZ="$TZ"
export DNSMASQ_LISTENING="$DNSMASQ_LISTENING"
export PIHOLE_DNS_="$PIHOLE_DNS"

if [ -n "$VIRTUAL_HOST" ]; then
    export VIRTUAL_HOST="$VIRTUAL_HOST"
fi

bashio::log.info "Starting Pi-hole..."
bashio::log.info "Web interface will be available on port 8080"
bashio::log.info "DNS server will be available on port 53"

# Start Pi-hole using the original entrypoint
exec /s6-init