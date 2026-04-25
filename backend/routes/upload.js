const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractTextFromFile } = require('../services/parsers');
const { parseResumeToJSON } = require('../services/llm');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Store file to disk AND memory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Clean up existing resume files to avoid conflicts
    try {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(f => {
        if (f.startsWith('resume.')) {
          fs.unlinkSync(path.join(uploadsDir, f));
        }
      });
    } catch (err) {
      console.warn('Error cleaning uploads dir:', err);
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const mimetype = req.file.mimetype;
    const originalname = req.file.originalname;

    // 1. Extract raw text (or HTML for DOCX)
    const rawText = await extractTextFromFile(fileBuffer, mimetype, originalname);

    // 2. Parse text to structured JSON using Gemini
    const portfolioData = await parseResumeToJSON(rawText);

    // 3. Return clean JSON + file URL for download
    const resumeUrl = `/uploads/${req.file.filename}`;
    res.json({ data: portfolioData, resumeUrl });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

module.exports = router;
