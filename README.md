# Portfolio Builder

An AI-powered SaaS platform that transforms resumes into professional, high-performance portfolio websites. This project automates the entire process from document parsing to live deployment on GitHub Pages.

## Design Reference

The portfolio template's aesthetic and layout are built with reference to the exceptional work of Brittany Chiang (brittanychiang.com), focusing on a clean, accessible, and high-visibility professional presentation.

## Project Structure

- **Frontend**: A Next.js application providing a real-time editor, drag-and-drop section management, and live portfolio preview.
- **Backend**: A Node.js/Express server that handles AI-driven resume parsing (Gemini AI), ZIP export generation, and automated GitHub repository creation/deployment.
- **Template**: A fast, Vite-powered React template used as the base for all generated portfolios.

## Key Features

- **AI Resume Parsing**: Upload PDF or DOCX files to automatically extract skills, experience, and projects using Google Gemini.
- **Live Sidebar Editor**: Update basic info, contact details, and social links with instant live preview.
- **Interactive Management**: Reorder experience and project cards using drag-and-drop.
- **AI Content Improvement**: Enhance bullet points and summaries directly within the editor using specialized AI prompts.
- **One-Click Deployment**: Automatically create a GitHub repository, enable GitHub Pages, and trigger a CI/CD workflow to host your site.
- **Dynamic Assets**: Automatically generates initials-based favicons and professional SEO metadata for every user.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key
- GitHub Personal Access Token

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/mrsourodip/portfolio-builder.git
cd portfolio-builder
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit the `.env` file and add your `GEMINI_API_KEY`.

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

### 4. Run the application
Run the backend (from the `backend` directory):
```bash
npm run dev
```

Run the frontend (from the `frontend` directory):
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

## Deployment & GitHub Token

To use the one-click deployment feature, you must provide a GitHub Personal Access Token. 

### Required Permissions

#### Option 1: Classic Token (Recommended)
Generate a token with the following scopes:
- `repo` (Full control of private and public repositories)
- `workflow` (Required to create the deployment action)

#### Option 2: Fine-grained Token
Generate a token with the following repository permissions:
- **Administration**: Read and Write (to enable GitHub Pages)
- **Contents**: Read and Write (to push code)
- **Pages**: Read and Write (to configure hosting)
- **Workflows**: Read and Write (to set up the CI/CD pipeline)

## Local Development Note

When running locally, the builder communicates with the backend on port 3005. Ensure no other service is occupying this port.
