require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ database: connected ? 'connected' : 'disconnected' });
});

app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();

  const message = process.env.MONGODB_URI
    ? 'Cannot connect to MongoDB. Check the database connection in server/.env.'
    : 'MongoDB is not configured. Set MONGODB_URI in server/.env.';
  res.status(503).json({ error: message });
});
app.use('/api', require('./routes'));

// Serve root static files (HTML, CSS, JS, Assets)
const rootStatic = path.join(__dirname, '..');
app.use(express.static(rootStatic));

// Serve client/dist if built
const dist = path.join(__dirname, '../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
}

// Fallback to index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const filePath = path.join(rootStatic, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  res.sendFile(path.join(rootStatic, 'index.html'));
});

// Keep the frontend available even when MongoDB has not been configured.
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🌿 ArtNova AI is running live at: http://localhost:${PORT}`);
    console.log(`📂 Frontend server is ready.`);
    console.log(`======================================================\n`);
  });
};

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB database');
      startServer();
    })
    .catch((err) => {
      console.warn('MongoDB connection note:', err.message);
      console.log('Starting the server; database-backed API requests will return an error until MongoDB is available.');
      startServer();
    });
} else {
  console.warn('MongoDB is not configured. Set MONGODB_URI in server/.env to enable sign-in and other database features.');
  startServer();
}
