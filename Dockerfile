# ---- Stage 1: Build the React/Next.js Frontend ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install frontend dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code and build it (produces static files in /out)
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Prepare the Express Backend ----
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

# Install backend dependencies (production only)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# ---- Stage 3: Unified Production Runner ----
FROM node:20-alpine
WORKDIR /app

# Step 3a. Move backend code and node_modules into the final image
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/

# Step 3b. Move Built frontend static files so Express can serve them
COPY --from=frontend-builder /app/frontend/out ./frontend/out

# CRITICAL: The backend's `syncTemplate.js` physically reads this React file from the disk to generate portfolios!
COPY frontend/src/portfolio-theme/PortfolioPreview.tsx ./frontend/src/portfolio-theme/PortfolioPreview.tsx

# Create uploads directory with correct permissions for the API to save PDFs
RUN mkdir -p ./backend/uploads && chown -R node:node ./backend/uploads

# Expose port 3005 to the outside world
EXPOSE 3005

# Start the Node Express Server
WORKDIR /app/backend
ENV PORT=3005
ENV NODE_ENV=production

CMD ["node", "server.js"]
