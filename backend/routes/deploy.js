const express = require('express');
const router = express.Router();
const { Octokit } = require('octokit');
const fs = require('fs/promises');
const path = require('path');
const { getTransformedAppCode } = require('../services/syncTemplate');

async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

router.post('/', async (req, res) => {
  try {
    const { portfolioData, githubToken, repoName = 'my-portfolio' } = req.body;

    if (!portfolioData || !githubToken) {
      return res.status(400).json({ error: 'Missing portfolioData or githubToken.' });
    }

    const octokit = new Octokit({ auth: githubToken });

    // Get the latest transformed UI code
    const transformedAppCode = await getTransformedAppCode();

    // 1. Get User
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    // 2. Create or Get Repo
    let repo;
    try {
      const { data: existingRepo } = await octokit.rest.repos.get({
        owner: user.login,
        repo: repoName
      });
      repo = existingRepo;
    } catch (e) {
      if (e.status === 404) {
        const { data: newRepo } = await octokit.rest.repos.createForAuthenticatedUser({
          name: repoName,
          description: 'My Backend Portfolio created with AI Portfolio Generator',
          private: false,
          auto_init: true
        });
        repo = newRepo;
      } else {
        throw e;
      }
    }

    // 3. Prepare blobs for all files in template
    const templateDir = path.join(__dirname, '../template');
    const allFiles = await getFiles(templateDir);
    const validFiles = allFiles.filter(f => !f.includes('node_modules') && !f.includes('dist') && !f.includes('.git'));

    // Upload blobs & create tree
    const tree = [];
    for (const filePath of validFiles) {
      const relativePath = path.relative(templateDir, filePath);
      
      // Use dynamic code for App.tsx, otherwise read from disk
      let content;
      if (relativePath === 'src/App.tsx') {
        content = transformedAppCode;
      } else {
        content = await fs.readFile(filePath, 'utf8');
      }

      // Create blob
      const { data: blob } = await octokit.rest.git.createBlob({
        owner: user.login,
        repo: repo.name,
        content: content,
        encoding: 'utf-8'
      });

      tree.push({
        path: relativePath,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      });
    }

    // Add resume file if it exists and determine the final filename
    let resumeFilename = null;
    let resumeBlobSha = null;
    const uploadsDir = path.join(__dirname, '../uploads');
    try {
      const resumeFiles = await fs.readdir(uploadsDir);
      const resumeFile = resumeFiles.find(f => f.startsWith('resume.'));
      if (resumeFile) {
        const resumePath = path.join(uploadsDir, resumeFile);
        const resumeBuffer = await fs.readFile(resumePath);
        
        const { data: resumeBlob } = await octokit.rest.git.createBlob({
          owner: user.login,
          repo: repo.name,
          content: resumeBuffer.toString('base64'),
          encoding: 'base64'
        });
        resumeBlobSha = resumeBlob.sha;

        const ext = resumeFile.split('.').pop();
        const userName = portfolioData.name || 'User';
        const formattedName = userName.trim().split(/\s+/).map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join("_");
        resumeFilename = `${formattedName}_Resume.${ext}`;

        tree.push({
          path: `public/${resumeFilename}`,
          mode: '100644',
          type: 'blob',
          sha: resumeBlobSha
        });
      }
    } catch (e) {
      console.warn('Resume file not found for deploy');
    }

    // Add dynamic data.json
    const finalData = {
      ...portfolioData,
      resumeUrl: resumeFilename ? `./${resumeFilename}` : null
    };
    
    const { data: dataBlob } = await octokit.rest.git.createBlob({
      owner: user.login,
      repo: repo.name,
      content: JSON.stringify(finalData, null, 2),
      encoding: 'utf-8'
    });

    tree.push({
      path: 'public/data.json',
      mode: '100644',
      type: 'blob',
      sha: dataBlob.sha
    });

    const actionYaml = `
name: Deploy static content to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
    // Note: 'path: ./dist' is correct for Vite-based templates.

    const { data: actionBlob } = await octokit.rest.git.createBlob({
      owner: user.login,
      repo: repo.name,
      content: actionYaml,
      encoding: 'utf-8'
    });

    tree.push({
      path: '.github/workflows/deploy.yml',
      mode: '100644',
      type: 'blob',
      sha: actionBlob.sha
    });

    // Get current commit
    const defaultBranch = repo.default_branch || 'main';
    let currentCommitSha = null;
    let isRepoEmpty = false;

    try {
      const { data: ref } = await octokit.rest.git.getRef({
        owner: user.login,
        repo: repo.name,
        ref: `heads/${defaultBranch}`
      });
      currentCommitSha = ref.object.sha;
    } catch (e) {
      if (e.status === 409 || e.status === 404) {
        // 409 means "Git Repository is empty", 404 means the branch doesn't exist
        isRepoEmpty = true;
      } else {
        throw e;
      }
    }

    // Create tree
    const treeParams = {
      owner: user.login,
      repo: repo.name,
      tree: tree
    };
    if (currentCommitSha) {
      treeParams.base_tree = currentCommitSha;
    }
    const { data: newTree } = await octokit.rest.git.createTree(treeParams);

    // Create commit
    const commitParams = {
      owner: user.login,
      repo: repo.name,
      message: currentCommitSha ? 'Update portfolio' : 'Initial portfolio commit',
      tree: newTree.sha,
      parents: currentCommitSha ? [currentCommitSha] : []
    };
    const { data: newCommit } = await octokit.rest.git.createCommit(commitParams);

    // Update or Create ref
    if (isRepoEmpty) {
      await octokit.rest.git.createRef({
        owner: user.login,
        repo: repo.name,
        ref: `refs/heads/${defaultBranch}`,
        sha: newCommit.sha
      });
    } else {
      await octokit.rest.git.updateRef({
        owner: user.login,
        repo: repo.name,
        ref: `heads/${defaultBranch}`,
        sha: newCommit.sha
      });
    }

    // 4. Enable/Update GitHub Pages to use "GitHub Actions" source
    // Note: We do this from the backend because GITHUB_TOKEN in the Action cannot enable Pages.
    try {
      console.log('Attempting to enable GitHub Pages...');
      await octokit.rest.repos.createPagesSite({
        owner: user.login,
        repo: repo.name,
        build_type: 'workflow'
      });
    } catch (e) {
      // If it fails with 409 (already exists) or 403 (for user sites), try updating instead
      try {
        console.log('Pages might already exist, attempting update to "workflow" source...');
        await octokit.rest.repos.updateInformationAboutPagesSite({
          owner: user.login,
          repo: repo.name,
          build_type: 'workflow'
        });
      } catch (updateError) {
        console.warn('Could not automate Pages enablement:', updateError.message);
      }
    }

    res.json({ success: true, url: `https://${user.login}.github.io/${repo.name}`, repoUrl: `https://github.com/${user.login}/${repo.name}` });

  } catch (error) {
    console.error("Deploy error:", error);
    res.status(500).json({ error: error.message || 'Internal server error during deploy.' });
  }
});

module.exports = router;
