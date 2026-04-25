# Frontend Editor

The user-facing interface for the Portfolio Builder, designed for high-performance editing and real-time visualization.

## Core Responsibilities

1. **State Management**: Centralized store for portfolio data using Zustand.
2. **Real-time Preview**: Instant visual feedback of all content and layout changes.
3. **Drafting Tools**: AI-assisted writing and drag-and-drop section reordering.
4. **Export Interface**: Management of the deployment and ZIP generation workflow.

## The Editorial Flow

### 1. Data Hydration (Upload)
- When a user uploads a resume, the frontend sends the file to the backend's `/api/upload` endpoint.
- Upon success, the `portfolioStore` is hydrated with the AI-parsed JSON.
- The UI instantly updates to reflect the new data.

### 2. Live Changes & Validation
- **Instant Sync**: Every keystroke in the `EditorSidebar` updates the global store.
- **Visual Validation**: The `PortfolioPreview` component is reactive to the store; changes in experience descriptions, skills, or project links are rendered immediately.
- **Layout Control**: Uses `@dnd-kit` to allow users to physically reorder their professional experience and project history.

### 3. Finalization (Deploy/Export)
- **Deployment**: The `EditorSidebar` opens a deployment modal to collect GitHub credentials. It communicates with the backend to initiate the repository creation process.
- **Exporting**: Sends the current state of the global store to the backend to generate a clean, production-ready ZIP archive.

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Drag & Drop**: @dnd-kit
- **Notifications**: react-hot-toast

## Running Locally

1. Install dependencies: `npm install`
2. Start development server: `npm run dev` (Runs on port 3000).
3. Ensure the backend is running on port 3005 for API requests to resolve.
