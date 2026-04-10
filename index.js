const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

let pool;
try {
  pool = require('./db');
} catch (e) {
  console.error("Critical DB Load Error:", e);
}

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

app.use(cors());
app.use(express.json());

// --- Health Checks (Robust Matching) ---

// This works if Vercel passes the full path /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", path: "api-health", timestamp: new Date().toISOString() });
});

// This works if Vercel passes the sub-path /health
app.get('/health', (req, res) => {
  res.json({ status: "ok", path: "health", timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ success: true, server: "Bader Node Engine" });
});

// --- Diagnostic Route ---
const handleTestDb = async (req, res) => {
  if (!pool) return res.status(500).json({ error: "Pool not loaded" });
  try {
    const [rows] = await pool.execute("SHOW TABLES");
    res.json({ success: true, connected: true, tables: rows.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

app.get('/api/test-db', handleTestDb);
app.get('/test-db', handleTestDb);

// Auth routes are handled by separate files in api/auth/ folder

module.exports = app;
