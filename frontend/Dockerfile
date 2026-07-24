FROM node:20-alpine AS builder
WORKDIR /app
# Placeholder for build process
RUN echo "Pending..."

FROM nginx:alpine
# COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
