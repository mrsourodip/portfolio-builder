# Architecture and Workflow Deep Dive

This document provides a technical walkthrough of how the Portfolio Builder functions, from the initial design philosophy to the automated deployment pipeline.

## 1. Design Philosophy

The project adheres to a "Premium Developer Aesthetic," characterized by high contrast, elegant typography, and subtle interactive elements.

- **Visual Reference**: Heavily inspired by the layout of Brittany Chiang's portfolio. It uses a **two-column layout** on desktop: a sticky left column for identity/navigation and a scrolling right column for content.
- **Color Palette**: Uses a deep Slate background (`bg-slate-900`) with high-visibility Teal accents (`text-teal-400`) and soft white text for body content.
- **Responsiveness**: Implements a transition from a side-by-side layout on large screens to a single-column, bottom-reaching layout on mobile devices.
- **Micro-interactions**: Includes a custom glow orb that follows the mouse cursor (on non-touch devices) and smooth scroll-into-view animations for navigation links.

## 2. The Data Lifecycle

The system transforms raw, unstructured documents into a structured digital identity.

### Phase A: Extraction
When a resume is uploaded, the backend performs two levels of extraction:
1. **Plain Text/HTML**: Extracts content from PDF or DOCX.
2. **Hyperlink Metadata**: Specifically for PDFs, `pdfjs-dist` scans the internal document tree for link annotations. This ensures that a link labeled "GitHub" actually retrieves the correct URL, even if the text doesn't contain the full address.

### Phase B: AI Semantic Mapping
The extracted text is sent to **Google Gemini** with a precise instruction prompt. The AI doesn't just copy text; it:
- Infers the professional title based on the overall experience.
- Rewrites the "About" section into a compelling third-person or first-person bio.
- Identifies and categorizes skills.
- Cleans up date ranges to a standard format ("Year — Year").

### Phase C: Reactive State
The frontend receives this JSON and hydrates a **Zustand store**. Every component in the sidebar editor is bound to this store. As the user edits their name or reorders their experience via drag-and-drop, the store updates, and the `PortfolioPreview` component re-renders instantly without a page refresh.

## 3. The "Template Sync" Engine

One of the project's most unique features is how it bridges development and production.

Normally, templates are static files. In this project, the template is **dynamically generated** from the live code:
1. **Source Tracking**: The backend monitors `frontend/src/portfolio-theme/PortfolioPreview.tsx`.
2. **Transformation**: When an export or deploy is requested, `syncTemplate.js` reads this file and performs a "source-to-source transition."
   - It removes `use client` directives.
   - It replaces the `usePortfolioStore` hook with a standard React `useState` that fetches from a local `data.json`.
   - It re-configures absolute paths to relative paths (e.g., `./Resume.docx`) to ensure compatibility with GitHub Pages subdirectories.
3. **Validation**: This ensures that if you update the UI code today, every user who deploys from that moment on gets the updated design automatically.

## 4. Automated Deployment Pipeline

The deployment process abstracts away the complexity of Git and GitHub hosting.

1. **Repo Lifecycle**: The backend uses the user's Personal Access Token (PAT) via Octokit to create a repository.
2. **Blob Strategy**: Instead of cloning the repo locally, the backend pushes content directly as **Git Blobs**. This allows for extremely fast deployment without needing a Git installation on the server.
3. **CI/CD Injection**: A custom `.github/workflows/deploy.yml` is injected. This action is designed to:
   - Install dependencies.
   - Build the Vite project.
   - Deploy specifically the `dist/` folder to GitHub Pages.
4. **Pages Enablement**: Since creating a repo doesn't automatically enable Pages, the backend makes an extra API call to GitHub to configure the "GitHub Actions" source for hosting.

## 5. Deployment Success States

The UI provides a professional confirmation panel once deployment is initiated:
- **Repo Link**: Direct access to the source code.
- **Live URL**: Calculated based on the user's GitHub profile (`https://username.github.io/repo`).
- **Propagation Awareness**: Informs the user that GitHub Pages may take 60–120 seconds to complete the first build before the site is live.
