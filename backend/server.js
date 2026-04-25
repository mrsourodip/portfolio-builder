const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const deployRoutes = require('./routes/deploy');
const exportRoutes = require('./routes/export');
const improveRoutes = require('./routes/improve');

const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded resumes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/upload', uploadRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/improve', improveRoutes);

// Serve Frontend statically if 'out' directory exists (monorepo production mode)
const frontendPath = path.join(__dirname, '../frontend/out');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  
  // SPA fallback for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
