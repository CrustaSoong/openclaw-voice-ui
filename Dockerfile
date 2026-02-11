FROM nginxinc/nginx-unprivileged:alpine

# Copy static files
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY config.js /usr/share/nginx/html/

# Runtime config generator
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
 && chown -R 101:0 /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Base image already runs unprivileged and listens on 8080
EXPOSE 8080

CMD ["/entrypoint.sh"]
