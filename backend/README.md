# Backend Service

The backend core of the Portfolio Builder, responsible for document processing, AI logic, and GitHub integration.

## Core Responsibilities

1. **Document Intelligence**: Parsing PDF and DOCX resumes into structured data.
2. **AI Orchestration**: Interfacing with Google Gemini for data extraction and content optimization.
3. **Template Synchronization**: Transforming frontend components into a standalone format for production.
4. **Cloud Deployment**: Automating the GitHub repository lifecycle and Pages hosting.

## The Processing Flow

### 1. Resume Upload
- **Storage**: Files are received via Multer and temporarily stored in `uploads/`.
- **Extraction**: The `parsers` service uses `pdf-parse` (with `pdfjs-dist` for link annotations) or `mammoth` to convert binary data into text/HTML.
- **LLM Mapping**: Gemini AI parses the raw text into a strictly typed JSON schema defined in the `llm` service.
- **Response**: Returns the structured JSON and a relative URL for the uploaded resume file.

### 2. Live Validation & Sync
- **Parity**: The `syncTemplate` service reads the actual `PortfolioPreview.tsx` file from the frontend development directory.
- **Transformation**: It dynamically strips Next.js specific logic (like "use client" or local store hooks) and replaces them with standard React hooks to ensure the exported code looks exactly like the live preview.
- **Audit**: Before any deployment, the system can run a sync audit to ensure the template is up-to-date with the latest UI changes.

### 3. Deployment Logic
- **Repository Creation**: Uses Octokit to create a new public repository for the user.
- **File Injection**: Pushes the transformed template code, the user's `data.json`, and the uploaded resume file as Git blobs.
- **CI/CD setup**: Generates a `.github/workflows/deploy.yml` file to handle automated builds.
- **Pages Automation**: Makes an additional API call to GitHub to enable "GitHub Actions" as the source for Pages hosting.

## Running Locally

1. Install dependencies: `npm install`
2. Configure `.env`: Needs `GEMINI_API_KEY` and optional GitHub credentials.
3. Start server: `npm run dev` (Runs on port 3005).

## Running via Docker Monorepo

When deployed via Docker, the backend `server.js` serves a dual purpose:
1. It hosts all `/api` endpoints.
2. It statically serves the compiled frontend (`../frontend/out`) directly on port `3005`.

This unified approach prevents path-resolution failures when `syncTemplate` attempts to parse the frontend's UI code for portfolio generation.
