# Portfolio Template

This portfolio was generated using the AI Portfolio Builder.

## Running Locally

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start development server:**
    ```bash
    npm run dev
    ```
3.  **Build for production:**
    ```bash
    npm run build
    ```

## GitHub Deployment Setup

To deploy this portfolio to GitHub Pages automatically, you must ensure your GitHub Personal Access Token (PAT) has the correct permissions.

### Option 1: Classic Token (Recommended)
Grant the following scopes:
- `repo` (Full control of private and public repositories)
- `workflow` (Update GitHub Action workflows)

### Option 2: Fine-grained Token
Grant the following **Repository permissions**:
- **Administration:** Read & Write
- **Contents:** Read & Write
- **Pages:** Read & Write
- **Workflows:** Read & Write

## Customizing Your Data
All your portfolio information is stored in `public/data.json`. You can manually edit this file to update your projects, skills, or contact info without redeploying the entire app.
