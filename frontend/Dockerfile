# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
# We don't bake the env vars at build time if we want to run the same image.
# However, Vite requires VITE_ prefixed vars at build time to inject them.
# To make it truly dynamic on Railway, we can either build it on Railway with the env vars,
# which Nixpacks does automatically, or we use a startup script to inject them.
# Since Railway passes env vars during the build phase natively, we just build.
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config to handle SPA routing and Railway PORT
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script to inject dynamic PORT provided by Railway
CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
