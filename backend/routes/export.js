const express = require('express');
const router = express.Router();
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { getTransformedAppCode } = require('../services/syncTemplate');

router.post('/', async (req, res) => {
  try {
    const { portfolioData } = req.body;

    if (!portfolioData) {
      return res.status(400).json({ error: 'Missing portfolioData in request body.' });
    }

    const templateDir = path.join(__dirname, '../template');
    
    // Get the latest transformed UI code
    const transformedAppCode = await getTransformedAppCode();
    
    res.attachment('portfolio.zip');
    
    // Use archiver
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      console.error(err);
      res.status(500).send({error: err.message});
    });

    archive.pipe(res);

    // Append all template files, except node_modules, dist, and the App source (we'll provide the latest)
    archive.glob('**/*', {
      cwd: templateDir,
      ignore: [
        'node_modules/**', 
        'dist/**', 
        'npm-debug.log', 
        'package-lock.json', 
        '.git/**',
        'src/App.tsx' // Ignore the static one, we'll append the synced one
      ]
    });

    // Append the latest synced App.tsx
    archive.append(transformedAppCode, { name: 'src/App.tsx' });

    // Append the latest resume if it exists
    let resumeFilename = null;
    const uploadsDir = path.join(__dirname, '../uploads');
    try {
      const resumeFiles = fs.readdirSync(uploadsDir);
      const resumeFile = resumeFiles.find(f => f.startsWith('resume.'));
      if (resumeFile) {
        const resumePath = path.join(uploadsDir, resumeFile);
        const ext = resumeFile.split('.').pop();
        const userName = portfolioData.name || 'User';
        const formattedName = userName.trim().split(/\s+/).map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join("_");
        resumeFilename = `${formattedName}_Resume.${ext}`;
        archive.file(resumePath, { name: `public/${resumeFilename}` });
      }
    } catch (e) {
      console.warn('Resume file not found for export');
    }

    // Append dynamic data.json into the public/ directory inside the template
    const finalData = { 
      ...portfolioData, 
      resumeUrl: resumeFilename ? `/${resumeFilename}` : null 
    };
    archive.append(JSON.stringify(finalData, null, 2), { name: 'public/data.json' });

    await archive.finalize();

  } catch (error) {
    console.error("Export error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error during export.' });
    }
  }
});

module.exports = router;
