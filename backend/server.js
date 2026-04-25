const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const deployRoutes = require('./routes/deploy');
const exportRoutes = require('./routes/export');
const improveRoutes = require('./routes/improve');

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

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
