# Docker Implementation details

Implementing Docker for the Portfolio Builder required solving a unique architectural challenge: combining a modern Next.js frontend with an Express backend that dynamically reads frontend source code (`PortfolioPreview.tsx`) to generate the final portfolios.

Here is a step-by-step breakdown of how the Docker monolith was achieved.

## Step 1: Converting Next.js to Static Export
By default, Next.js runs its own Node.js server to handle Server-Side Rendering (SSR). To combine it with the Express backend in a single container, it needed to be converted into a purely static format (HTML/JS/CSS).

*   **Action**: Updated `frontend/next.config.ts` to include `output: 'export'` and `distDir: 'out'`.
*   **Result**: Running `npm run build` now bypasses the Next.js node server and generates an optimized, deployable `out/` folder.

## Step 2: Dynamic API Routing
The frontend originally hardcoded `http://localhost:3005` to communicate with the backend.

*   **Action**: Replaced all hardcoded references in `EditorSidebar.tsx` and `PortfolioPreview.tsx` with a dynamic environment check:
    ```javascript
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
    fetch(`${API_BASE_URL}/api/upload`, ...);
    ```
*   **Result**: The frontend now dynamically references the correct host URL when deployed, eliminating Cross-Origin (CORS) errors.

## Step 3: Upgrading the Express Server
Instead of deploying two separate services, the Express backend was upgraded to act as the web server for the frontend.

*   **Action**: Added static routing logic to `backend/server.js`:
    ```javascript
    const frontendPath = path.join(__dirname, '../frontend/out');
    if (fs.existsSync(frontendPath)) {
      app.use(express.static(frontendPath));
      app.get(/.*/, (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
    }
    ```
*   **Result**: The backend now listens on Port `3005`. If an API route (e.g., `/api/deploy`) is hit, it executes backend logic. If any other route is hit, it serves the Next.js static website. 

*(Note: The wildcard `app.get(/.*/)` replaces the deprecated `app.get('*')` syntax for Express v5 compatibility).*

## Step 4: The Multi-Stage Dockerfile
A multi-stage `Dockerfile` was authored to keep the final image lightweight and secure by throwing away unnecessary build tools.

*   **Stage 1 (Frontend Builder)**:
    - Uses `node:20-alpine`.
    - Installs frontend dependencies.
    - Runs `npm run build` to generate the `/out` array.
*   **Stage 2 (Backend Builder)**:
    - Installs backend dependencies (`npm ci --omit=dev`), stripping out large dev libraries.
*   **Stage 3 (Production Runner)**:
    - Copies the node modules and backend files.
    - Copies the static `/out` files from the Frontend Builder.
    - **CRITICAL**: Copies `./frontend/src/portfolio-theme/PortfolioPreview.tsx` manually. This ensures `syncTemplate.js` can still physically read the frontend UI file during deployment!
    - Creates the `backend/uploads` directory and assigns proper read/write permissions.
    - Forces `ENV NODE_ENV=production` and exposes Port `3005`.

## Step 5: .dockerignore Optimization
*   **Action**: Created a `.dockerignore` file to block `node_modules`, `.git`, `.env`, and existing `backend/uploads` from being copied during the image build.
*   **Result**: Keeps the build context extremely fast and prevents local test resumes or secrets from leaking into the production image.
