# Build stage
FROM node:20-alpine AS builder

# Accept build arguments
ARG VITE_SERVER
ARG VITE_CHATSERVER
ARG VITE_GOOGLE_BOOKS_API_KEY
ARG VITE_RAPID_API_KEY
ARG VITE_ISBNDB_API_KEY
ARG VITE_GOOGLECRED
ARG VITE_UNSPLASH_API_KEY
ARG GIT_SHA

# Set environment variables from build args
ENV VITE_SERVER=$VITE_SERVER
ENV VITE_CHATSERVER=$VITE_CHATSERVER
ENV VITE_GOOGLE_BOOKS_API_KEY=$VITE_GOOGLE_BOOKS_API_KEY
ENV VITE_RAPID_API_KEY=$VITE_RAPID_API_KEY
ENV VITE_ISBNDB_API_KEY=$VITE_ISBNDB_API_KEY
ENV VITE_GOOGLECRED=$VITE_GOOGLECRED
ENV VITE_UNSPLASH_API_KEY=$VITE_UNSPLASH_API_KEY
ENV GIT_SHA=$GIT_SHA

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