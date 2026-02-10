#!/bin/sh
set -eu

# Runtime config via environment variables
# OPENCLAW_GATEWAY_URL:  ws://openclaw:18789 (example)
# OPENCLAW_GATEWAY_TOKEN: optional

GATEWAY_URL="${OPENCLAW_GATEWAY_URL:-}"
GATEWAY_TOKEN="${OPENCLAW_GATEWAY_TOKEN:-}"

# Minimal JS escaping for backslashes + double-quotes
esc() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > /usr/share/nginx/html/config.js <<EOF
// Generated at container start from environment variables.
window.__OPENCLAW_CONFIG__ = {
  gatewayUrl: "$(esc "$GATEWAY_URL")",
  gatewayToken: "$(esc "$GATEWAY_TOKEN")"
};
EOF

exec nginx -g 'daemon off;'
