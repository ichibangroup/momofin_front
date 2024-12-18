# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Run stage
FROM nginx:alpine AS runner

# Create a non-root user and set up directories
ARG USER_NAME=reactuser
ARG USER_UID=1000
ARG USER_GID=${USER_UID}

RUN addgroup -g ${USER_GID} ${USER_NAME} \
    && adduser -D -u ${USER_UID} -G ${USER_NAME} ${USER_NAME} \
    && mkdir -p /var/cache/nginx /var/log/nginx /var/run /etc/nginx/conf.d \
    && chown -R ${USER_NAME}:${USER_NAME} /var/cache/nginx /var/log/nginx /var/run /etc/nginx /usr/share/nginx/html \
    && chmod -R 755 /var/cache/nginx /var/log/nginx /var/run /etc/nginx /usr/share/nginx/html

# Copy the built app from the builder stage
COPY --from=builder --chown=${USER_UID}:${USER_GID} /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

# Switch to non-root user
USER ${USER_NAME}

CMD ["nginx", "-g", "daemon off;"]