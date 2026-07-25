FROM node:20-alpine AS builder

WORKDIR /app

# Copy the frontend application
COPY apps/stitch-admin/package.json apps/stitch-admin/package-lock.json* ./apps/stitch-admin/

# Install dependencies inside the stitch-admin folder
WORKDIR /app/apps/stitch-admin
RUN npm ci || npm install

# Copy the rest of the application
COPY apps/stitch-admin/ ./

# Build the specific app (Vite will read environment variables like VITE_API_URL here if passed by Railway)
RUN npm run build

# Stage 2: Serve the built static files using a simple Node.js server
FROM node:20-alpine AS runner

WORKDIR /app

# Install the 'serve' package globally
RUN npm install -g serve

# Copy the built assets from the builder stage
COPY --from=builder /app/apps/stitch-admin/dist ./dist

# Railway provides the PORT environment variable dynamically
ENV PORT=3000
EXPOSE $PORT

# Start the 'serve' server on the specified port
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
