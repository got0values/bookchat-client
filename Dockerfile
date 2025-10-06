# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:1.25-alpine AS server
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/conf.d/
EXPOSE 5500
ENTRYPOINT ["nginx", "-g", "daemon off;"]