FROM nginxinc/nginx-unprivileged:alpine

# Copy static files (ensure they are writable by the unprivileged nginx user)
COPY --chown=101:0 index.html /usr/share/nginx/html/
COPY --chown=101:0 app.js /usr/share/nginx/html/
COPY --chown=101:0 config.js /usr/share/nginx/html/

# Runtime config generator
# BuildKit supports --chmod so we don't need a privileged RUN step.
COPY --chmod=755 entrypoint.sh /entrypoint.sh

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Base image already runs unprivileged and listens on 8080
EXPOSE 8080

CMD ["/entrypoint.sh"]
