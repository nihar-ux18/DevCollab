FROM node:18-alpine AS builder

WORKDIR /app

# Copy frontend source
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci --only=production

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

FROM node:18-alpine

WORKDIR /app

# Copy backend source
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

COPY backend/ ./backend/
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
WORKDIR /app/backend
CMD ["npm", "start"]